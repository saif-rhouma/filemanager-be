import express, { Express, Router as IRouter } from 'express';

import { AuthRoutes } from './apis/auth.routes';
import { ExampleRoutes } from './apis/example.routes';
import HTTP_CODE from '../core/constants/httpCode';
import IRouteGroup from '../types/IRouteGroup';
import runAsyncWrapper from '../utils/runAsyncWrapper';

class Router {
  router: IRouter;
  authRoutes: IRouteGroup;
  exampleRoutes: IRouteGroup;

  constructor() {
    this.router = express.Router();
    this.authRoutes = AuthRoutes;
    this.exampleRoutes = ExampleRoutes;
  }

  public create(app: Express) {
    // TODO : attach middleware
    this._handleExampleAPI();
    this._handleAuthAPI();
    this._handlePageNotFound();
    this._handleExceptions();
    app.use(this.router);
  }

  private _handlePageNotFound() {
    this.router.all('*', async (_req, res) => {
      res.status(HTTP_CODE.NotFound).send('Page Not Found');
    });
  }

  private _handleExceptions() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.router.use((err, _req, res, _next) => {
      err.statusCode = err.status || err.statusCode || HTTP_CODE.InternalServerError;
      return res.status(err.statusCode).json({
        errorCode: err.message,
        statusCode: err.status,
        details: err.details,
      });
    });
  }

  //! Apis Routes

  private _handleAuthAPI() {
    this._attachRoutes(this.authRoutes, '/api');
  }

  private _handleExampleAPI() {
    this._attachRoutes(this.exampleRoutes, '/api/test');
  }

  private _attachRoutes(routeGroup: IRouteGroup, prefix: string = '') {
    [routeGroup].forEach(({ group, routes }) => {
      routes.forEach(({ method, path, middleware = [], validator = [], handler }) => {
        this.router[method](
          prefix + group.prefix + path,
          [...(group.middleware || []), ...middleware],
          [...validator],
          runAsyncWrapper(handler)
        );
      });
    });
  }
}

export default new Router();
