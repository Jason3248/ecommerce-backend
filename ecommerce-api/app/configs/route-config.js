const path = require("path");
const routes = require("./route.config.json");
module.exports = (app) =>
{
    const controllers = new Map();
    routes.forEach((route) =>
    {
        const controllerPath = path.resolve(__dirname, `../components/${route.controller}/${route.controller}.controller.js`);

        if (!controllers.has(controllerPath))
        {
            const Controller = require(controllerPath);

            console.log("Controller:", Controller);
            console.log("Type:", typeof Controller);

            controllers.set(controllerPath, new Controller());
        }
        const controller = controllers.get(controllerPath);
        const method = route.method.toLowerCase();
        if (typeof app[method] !== "function")
            throw new Error(`Unknown method: ${method}`);
        if (typeof controller[route.action] !== "function")
            throw new Error(`Unknown action: ${route.action}`);
        // const chain = route.middlewareNameList.map((name) =>
        // {
        //     if (!middleware[name]) throw new Error(`Unknown middleware: ${name}`);
        //     return middleware[name];
        // });
        app[method](route.route, controller[route.action].bind(controller));
    });
};