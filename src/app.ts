import { Request, Response } from "express";
import {
    METHOD,
    routeConfig,
    routeLog,
    routesAuth,
    server
} from "./decorators/config";

class Routes {
    @routeLog()
    @routesAuth(
        "Authorization"
    )
    @routeConfig({
        method: METHOD.GET,
        path: "/health"
    })
    public index(
        request: Request,
        response: Response
    ) {
        return response.json({
            status: true,
            message:"Welcome to my service"
        });
    }
}

server.start();