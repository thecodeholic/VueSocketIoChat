const {Generator} = require('qa-screenshot-comparator');
const path = require('path');
const stringHelper = require('./../helpers/stringHelper');
const models = require('../db/models');
const ConnectionData = require('./ConnectionData');
const companyId = 1;

class Connection {

  constructor(socket, userId) {
    this.socket = null;
    this.userId = userId;
    /**
     * @type {ConnectionData}
     */
    this.data = new ConnectionData();
    this.setIoSocket(socket);

    //Initial function to be triggered
    this.sendInitData();

    //Event listeners from client side
    this.onDisconnect();
  }

  setIoSocket(socket) {
    this.socket = socket;
    this.initSocketListeners();
  }

  initSocketListeners() {
    this.socket.on('generate screenshot', this.onGenerateScreenshots.bind(this));
    this.socket.on('disconnect', function () {
      console.log('User was disconnected');
    });
    this.socket.on('init', () => {
      this.socket.emit('initSocketData', this.data);
    });

    this.socket.on('initComparison', () => {
      this.socket.emit('initComparison', this.data.comparisonData);
    });
  }

  onDisconnect() {

  }

  async onGenerateScreenshots(data) {

    let requestObject = data;

    if (!requestObject || !requestObject.resolution_name) {
      this.socket.emit('onGenerateScreenshotError', 'Invalid params provided');
    }

    let stableVersion;
    let project;

    try {
      this.data.domain = await models.project.Domain.getDomain(requestObject.domain_id);
      if (!this.data.domain) {
        this.socket.emit('onGenerateScreenshotError', 'Domain Not Found');
        return;
      }
      stableVersion = await models.project.ScreenshotVersion.findByPk(requestObject.stable_version_id);

      if (stableVersion) {
        this.data.stableVersion_id = stableVersion.dataValues.id;
        this.data.stableFolder = stableVersion.dataValues.folder_name;
        this.data.outputFolder = stringHelper.getUniqueString();
      }

      project = this.data.domain.project;

      if (!project) {
        this.socket.emit('onGenerateScreenshotError', 'Project Not Found');
        return;
      }

      this.data.resolution_name = requestObject.resolution_name;
      this.data.description = requestObject.description;

      this.data.currentFolder = stringHelper.getUniqueString();
      this.data.screenshotsFolder = path.dirname(process.argv[1]) + `/public/screenshots/${companyId}`;
      this.data.timeInSeconds = 0;
      this.data.generationStatus = true;
      this.data.markedResolutions = requestObject.resolution_name;

      let generatorObject = new Generator({
        url: this.data.domain.domain_name,
        generateSitemap: true,
        outputFolder: this.data.outputFolder,
        currentFolder: this.data.currentFolder,
        stableFolder: this.data.stableFolder,
        resolutionName: requestObject.resolution_name,
        includeThumbnails: true,
        folderName: project.folder_name,
        thumbnailWidth: 100,
        authParams: this.data.domain.getAuthParams(),
        runtime: this.data.screenshotsFolder,
        onUrlFind: this.urlFind.bind(this),
        onUrlFindError: this.urlFindError.bind(this),
        onUrlFindFinish: this.urlFindFinish.bind(this),
        onScreenshotGenerationStart: this.screenshotGenerationStart.bind(this),
        onScreenshotGenerate: this.screenshotGenerate.bind(this),
        onScreenshotCompare: this.screenshotCompare.bind(this),
        onScreenshotGenerationFinish: this.screenshotGenerationFinish.bind(this)
      });

      let timerInstance = setInterval(() => {
        this.data.timeInSeconds++;
        this.socket.emit('timerChange', {
          timeInSeconds: this.data.timeInSeconds
        })
      }, 1000);

      await generatorObject.run();

      //This method create screenshotVersion,comparison and images.
      const newScreenshotVersion = await models.project.ScreenshotVersion.createScreenshotAfterGenerate(this.data);

      this.socket.emit('onScreenshotVersionCreationFinish', newScreenshotVersion);

      // Stop timer
      clearInterval(timerInstance);
      this.data.emptyUserData();

    } catch (error) {
      console.log(error);
      this.socket.emit('onGenerateScreenshotError', 'Error while processing domain');
    }

  }

  urlFindError(data) {
    console.log("urlFindError", data);
  }

  urlFind(data) {
    this.data.foundUrls.push({
      url: data.url
    });
    this.socket.emit('onUrlFound', JSON.stringify(data));
  }

  urlFindFinish(data) {
    this.data.toBeGeneratedScreenshotsCount = data.foundUrlCount * this.data.markedResolutions.length;
    this.socket.emit('onUrlFindFinish', {
      toBeGeneratedScreenshotsCount: this.data.toBeGeneratedScreenshotsCount
    });
  }

  screenshotCompare(data) {

    const projectFolderName = this.data.domain.project.folder_name;
    const comparisonFolderName = this.data.outputFolder;

    //https://stackoverflow.com/questions/8376525/get-value-of-a-string-after-a-slash-in-javascript
    if (data.newImage) {
      let stableImage = {
        resolution: data.resolutionName,
        name: /[^/]*$/.exec(data.stableImage)[0],
        url: data.url,
      };
      let newImage = {
        resolution: data.resolutionName,
        name: /[^/]*$/.exec(data.newImage)[0],
        url: data.url,
      };

      this.data.comparisonImages.push(newImage);
      this.data.comparisonImages.push(stableImage);
    }

    let emitData = {};
    emitData.resolution = data.resolutionName;

    if (data.newImage) {
      emitData['new'] = {
        img_path: `screenshots/1/${projectFolderName}/${comparisonFolderName}/${emitData.resolution}/` + /[^/]*$/.exec(data.newImage)[0],
        thumbnail_path: `screenshots/1/${projectFolderName}/${comparisonFolderName}/${emitData.resolution}-thumbnails/` + /[^/]*$/.exec(data.new_thumb)[0],
        name: /[^/]*$/.exec(data.newImage)[0],
        url: data.url,
      }
    }

    if (data.stableImage) {
      emitData['stable'] = {
        img_path: `screenshots/1/${projectFolderName}/${comparisonFolderName}/${emitData.resolution}/` + /[^/]*$/.exec(data.stableImage)[0],
        thumbnail_path: `screenshots/1/${projectFolderName}/${comparisonFolderName}/${emitData.resolution}-thumbnails/` + /[^/]*$/.exec(data.stable_thumb)[0],
        name: /[^/]*$/.exec(data.stableImage)[0],
        url: data.url,
      }
    }

    if (data.newImage) {
      this.data.comparisonData.push(emitData);
    }

    this.socket.emit('onScreenshotCompare', emitData);

  }

  screenshotGenerationFinish(data) {
    this.socket.emit('onScreenshotGenerationFinish', '');
  }

  screenshotGenerationStart(data) {
    this.socket.emit('onScreenshotGenerationStart', JSON.stringify(data));
  }

  screenshotGenerate(data) {
    let Image = {
      resolution: data.resolutionName,
      name: /[^/]*$/.exec(data.path)[0],
      url: data.url,
    };
    this.data.screenshotVersionImages.push(Image);
    this.data.generatedScreenshots++;
    this.socket.emit('onScreenshotGenerate', {
      resolution: data.resolutionName,
      url: data.url,
    });
  }

  sendInitData() {
    this.socket.emit('init', this.data);
  }

}

module.exports = Connection;
