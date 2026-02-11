const serviceModel = require("../models/service.model");

async function home(req, res) {
  res.render("home", {
    pageTitle: "Tule Express",
    active: "home"
  });
}

async function services(req, res) {
  const services = await serviceModel.listActive();
  res.render("services", {
    pageTitle: "Servicios",
    active: "services",
    services
  });
}

module.exports = { home, services };
