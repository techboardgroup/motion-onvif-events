const { Cam } = require('onvif');
const axios = require('axios');
const {exec, execSync} = require('child_process');
const dotenv = require('dotenv');

var ip;

module.exports = class Camera {
  constructor(onvifCam, motion, delay) {
    this.onvifCam = onvifCam;
    this.motion = motion;
    this.timeout = {
      id: null,
      delay,
    };
    this.prevMotionValue = false;
  }

  static async create({ hostname, username, password, port, timeout }, motion) {
    ip = hostname;
    const onvifCam = await this.createOnvifCam({
      hostname,
      username,
      password,
      port,
    });

    return new Camera(onvifCam, motion, timeout);
  }

  static createOnvifCam(conf) {
    return new Promise((resolve) => {
      const cam = new Cam(conf, (err) => {
        if (err) {
          this.log(`Error connecting to ONVIF Camera ${err}`);
          process.exit();
        }
        resolve(cam);
      });
    });
  }

  addEventListener() {
    this.onvifCam.on('event', (camMessage) => this.onEvent(camMessage));
    this.log('Start event listener');
  }

  onEvent(camMessage) {
    const topic = camMessage.topic._;
    if (topic.indexOf('RuleEngine/CellMotionDetector/Motion') !== -1) {
      this.onMotionDetected(camMessage);
    }
  }

  onMotionDetected(camMessage) {
    const isMotion = camMessage.message.message.data.simpleItem.$.Value;

    if (this.prevMotionValue === isMotion) {
      return;
    }

    this.log(`Motion detected: ${isMotion}`);

    if (isMotion && !this.timeout.id) {
      this.motion.eventStart();
    }

    if (isMotion && this.timeout.id) {
      clearTimeout(this.timeout.id);
      this.timeout.id = null;
    }

    if (!isMotion) {
      this.timeout.id = setTimeout(() => {
        this.motion.eventEnd();
        this.timeout.id = null;
      }, this.timeout.delay);
    }

    const camNumStr = ip.split(".")[3];
    const camNum = Number(camNumStr) - 1
    const serial = execSync('cat /etc/machine-id')
    axios.post(`${process.env.WEBURL}event`,
      {"serial": serial, "type": 1, "camera": camNum},
      {'Content-Type': 'application/json'})
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })

    this.prevMotionValue = isMotion;
  }

  log(msg) {
    const date = new Date().toLocaleString();
    console.log(`[${date}] Camera: ${msg}`);
  }
};
