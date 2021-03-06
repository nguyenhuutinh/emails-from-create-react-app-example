require("dotenv").config();
const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const mailer = require("./mailer");

const PORT = process.env.PORT || 5000;

// Multi-process to utilize all CPU cores.
if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
  
  app.use(express.json()); // Parse json in request. Available in express 4.16+

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

  // Answer API requests.
  app.post("/api/send_email", function(req, res) {
    res.set("Content-Type", "application/json");

    const { userName, email, job_title, company_name, message } = req.body;
    console.log(req.body)
    const locals = { userName, email, job_title , company_name, message};
    const messageInfo = {
      email,
      fromName: "IPification Website",
      subject: "We got new contact"
    };
    mailer.sendOne("droids", messageInfo, locals);
    res.send('{"message":"Email sent."}');
  });

  app.listen(PORT, function() {
    console.error(`Node cluster worker ${process.pid}: listening on port ${PORT}`);
  });
}
