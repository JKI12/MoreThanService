require('dotenv').config();

import req from 'request';
import jsdom from 'jsdom';
import fs from 'fs';

const baseUrl = process.env.BASE_URL;

let jar = req.jar();
let request = req.defaults({ jar });
const { JSDOM } = jsdom;

const timeoutTime = 1800000;

const getDashboard = () => {
  const url = `${baseUrl}/MyDashboard.aspx`;

  return new Promise((resolve, reject) => {
    if(jar.getCookies(baseUrl).length == 0) {
      login()
        .then(async () => {
          const data = await getDashboard();
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
      return;
    }

    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

const getMileage = (body) => {
    const { window } = new JSDOM(body);
    const document = window.document;

    const milesUsed = document.getElementById('ctl00_MainContent_MilesUsedLabel').innerHTML;
    const milesRemain = document.getElementById('ctl00_MainContent_MilesRemainingLabel').innerHTML;
    const milesExcess = document.getElementById('ctl00_MainContent_PredictedExcessLabel').innerHTML;

    return {
      used: milesUsed.replace(',', ''),
      remain: milesRemain.replace(',', ''),
      excess: milesExcess.replace(',', '')
    };
};

const getOverallImage = (body) => {
  const { window } = new JSDOM(body);
  const document = window.document;

  const url = `${baseUrl}/${document.getElementById('ctl00_MainContent_ChartOverall_Image').getAttribute('src')}`;

  return new Promise((resolve, reject) => {
    const result = downloadImage(url, './images/overallScore.png');

    if (result === 'error') {
      reject('error');
    } else {
      resolve('/images/overallScore.png');
    }
  });
};

const getDetailedView = () => {
  const url = `${baseUrl}/MyDrivingHistoryMoreDetails.aspx`;

  return new Promise((resolve, reject) => {
    if(jar.getCookies(baseUrl).length == 0) {
      login()
        .then(() => {
          getDetailedView();
        })
        .catch((error) => {
          reject(error);
        });
      return;
    }

    request(url, (error, response, body) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

const getDials = (body) => {
  const { window } = new JSDOM(body);
  const document = window.document;

  const speedDial = `${baseUrl}/${document.getElementById('ctl00_MainContent_SpeedDial_Image').getAttribute('src')}`;
  const smoothDial = `${baseUrl}/${document.getElementById('ctl00_MainContent_SmoothnessDial_Image').getAttribute('src')}`;
  const usageDial = `${baseUrl}/${document.getElementById('ctl00_MainContent_UsageDial_Image').getAttribute('src')}`;

  return new Promise((resolve, reject) => {
    const speedResult = downloadImage(speedDial, './images/speedResult.png');
    const smoothResult = downloadImage(smoothDial, './images/smoothResult.png');
    const usageResult = downloadImage(usageDial, './images/usageResult.png');

    const result = {};

    if (speedResult === 'error') {
      result['speed'] = 'error';
    } else {
      result['speed'] = '/images/speedResult.png';      
    }

    if (smoothResult === 'error') {
      result['smooth'] = 'error';
    } else {
      result['smooth'] = '/images/smoothResult.png';      
    }

    if (usageResult === 'error') {
      result['usage'] = 'error';
    } else {
      result['usage'] = '/images/usageResult.png';      
    }

    resolve(result);
  });
};

const getJourneys = (body) => {
  const { window } = new JSDOM(body);
  const document = window.document;

  const results = [];

  const tableRows = document.getElementById('ctl00_MainContent_JourneysGrid_ctl00')
    .getElementsByTagName('tbody')[0]
    .getElementsByTagName('tr');

  for(let i = 0; i < tableRows.length; i++) {
    const row = tableRows[i];
    const data = row.getElementsByTagName('td');

    const date = data[0].innerHTML;
    const sTime = data[1].innerHTML;
    const eTime = data[2].innerHTML;
    const speedScore = data[3].innerHTML;
    const smoothnessScore = data[4].innerHTML;
    const usageScore = data[5].innerHTML;
    const score = data[6].innerHTML;

    results.push(
      {
        date,
        sTime,
        eTime,
        scores: {
          speed: speedScore,
          smoothness: smoothnessScore,
          usage: usageScore,
          overall: score
        }
      }
    );
  }

  return results;
};

const downloadImage = (url, filename) => {
  request(url).pipe(fs.createWriteStream(filename))
  .on('close', () => {
    console.log(`Downloaded: ${filename}`);
    return 'success'
  })
  .on('error', (error) => {
    console.error(error);
    return 'error';
  });
};

export const getData = async() => {
  const dash = await getDashboard();
  const mileage = getMileage(dash);
  const overallScoreImage = await getOverallImage(dash);

  const detailed = await getDetailedView();
  const journeys = getJourneys(detailed);
  const dialImages = await getDials(detailed);
  
  return {
    miles: { ...mileage },
    images: {
      overallScore: overallScoreImage,
      dials: { ...dialImages }
    },
    journeys
  }
};

export const login = () => {
  const url = `${baseUrl}/Default.aspx`;

  const options = {
    url,
    headers: {
      Host: 'service.smartwheels.morethan.com',
      Connection: 'keep-alive',
      'Content-Length': '669',
      'Cache-Control': 'max-age=0',
      Origin: baseUrl,
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      Referer: url,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.8'
    },
    method: 'POST',
    form: {
      __EVENTTARGET: '',
      __EVENTARGUMENT: '',
      __VIEWSTATE: '/wEPDwUKMjEzNzMyOTIyNmRkLEoSfrAVCQOw3pdQfAww+egsXkoKi8p94X+/HB9nInw=',
      __VIEWSTATEGENERATOR: 'CA0B0334',
      __EVENTVALIDATION: '/wEdAATZ54GNqJE4ad7KDhJDdSNdSt/1+cDFAAhFLj34g5rZJc+9P3s0w+MeGOPom7ExypC9RB/c8DGz9SnisCqjuPbJP+BMOvSd/lXKVeEOeu1E7yISp+A0K5kzAZxn1C/xcwM=',
      ctl00$MainContent$Username: process.env.EMAIL,
      ctl00$MainContent$Password: process.env.PASSWORD,
      ctl00$MainContent$Login: 'Login',
      ctl00_RadScriptManager1_TSM: ';;System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35:en-US:93a6b8ed-f453-4cc5-9080-8017894b33b0:ea597d4b:b25378d2'
    },
    followRedirect: false,
    gzip: true
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error)
      } else {
        console.log('logged in');
        setTimeout(() => {
          console.log('cleared cookies');
          jar = req.jar();
          request = req.defaults({ jar });
        }, timeoutTime);
        resolve();
      }
    });
  });
};
