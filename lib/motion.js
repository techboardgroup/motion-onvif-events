const fetch = require('node-fetch');
const axios = require('axios');
const {exec, execSync} = require('child_process');
const dotenv = require('dotenv');

module.exports = class Motion {
  constructor({ base, camId }) {
    this.base = base;
    this.camId = camId;
  }

  fetch(path) {
    const url = new URL(`${this.camId}${path}`, this.base);
    return fetch(url);
  }

  eventStart() {
    console.log(" event start ")
    const serial = execSync('cat /etc/machine-id')
    axios.get(`${process.env.WEBURL}event/${serial}`,
      {'Content-Type': 'application/json'})
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  eventEnd() {
    console.log("event end");
  }

  log(msg) {
    const date = new Date().toLocaleString();
    console.log(`[${date}] Motion: ${msg}`);
  }
};
