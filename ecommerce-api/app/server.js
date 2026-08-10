const { sequelize } = require("ecommerce-data-model");
const app = require("./app");
const port = Number(process.env.PORT || 3000);
const logger = require("./configs/logger.js");

const start = async () =>
{
    try
    {
        await sequelize.authenticate();

        logger.info("Database connection established");

        const server = app.listen(port, () =>
        {
            logger.info("HTTP server started", {
                port,
                environment: process.env.NODE_ENV ?? "development"
            });
        });

        let isShuttingDown = false;
        const shutdown = async (signal) =>
        {
            if (isShuttingDown) return;
            isShuttingDown = true;

            logger.info("Shutdown signal received", { signal });

            try
            {
                await new Promise((resolve, reject) =>
                {
                    server.close((error) => (error ? reject(error) : resolve()));
                });
                logger.info("HTTP server closed");

                await sequelize.close();
                logger.info("Database connection closed");
                logger.info("Application shutdown completed");
            } catch (error)
            {
                logger.error("Application shutdown failed", { error, signal });
                process.exitCode = 1;
            }
        };

        process.once("SIGINT", () => shutdown("SIGINT"));
        process.once("SIGTERM", () => shutdown("SIGTERM"));

        return server;
    } catch (error)
    {
        logger.error("Application startup failed", { error });
        process.exitCode = 1;
        return null;
    }
};

module.exports = { start };