import { Server } from '../server';
import { Request, Response } from "express";

const server = new Server()
enum METHOD {
    GET = 'get',
    POST = 'post'
}

interface RouteConfigProps {
    method: METHOD;
    path: string;
}


function routeConfig({ method, path }: RouteConfigProps): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const response = async (req: Request, res: Response) => {
            try {
                const original = await descriptor.value(req, res);

                res.status(200).json(original);
            } catch (e: any) {
                res.status(500).json({
                    message: "Some error occurred",
                    error: e.message,
                    stack: e.stack,
                });
            }
        }

        server.app[method](path, response);
    }
}

function routeLog(): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let request = args[0] as Request;

            const {
                url,
                method,
                body,
                headers,
            } = request;

            console.log("[LOG]", {
                url,
                method,
                body,
                headers,
            });
            return original.apply(this, args);
        }
    };
}


function routesAuth(key: string): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;
        descriptor.value = function (...args: any[]) {

            const request = args[0] as Request;
            const response = args[1] as Response;

            const headers = request.headers;

            if (headers.authorization === `Bearer ${key}`) {
                return original.apply(this, args);
            }
            response.status(403).json({
                status: false,
                message: "You are not authorized to use this service",
                error: "Not Authorized"
            });
        }
    }
}

export {
    METHOD,
    routeConfig,
    routeLog,
    routesAuth,
    server
}