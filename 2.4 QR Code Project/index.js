import inquirer from 'inquirer';
import fs from 'fs';
import qr from 'qr-image';

// Prompt the user to enter a URL
inquirer
  .prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Enter your URL:',
    },
  ])
  .then((answers) => {
    // Get the user-provided URL
    const url = answers.url;

    // Generate a QR code for the URL and save it as an SVG file
    var qr_jpg = qr.image(url, { type: 'png' });
    qr_jpg.pipe(fs.createWriteStream('url_qr_code.png'));

    // Generate a QR code for the URL and get it as an SVG string
    var jpg_string = qr.imageSync(url, { type: 'png' });

    // Print the SVG string to the console
  })

