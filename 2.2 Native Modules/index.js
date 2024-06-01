const fs =require("fs");

fs.writeFile("message.text","mounika pig bhai",err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });

 fs.readFile("message.text",'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);
  });