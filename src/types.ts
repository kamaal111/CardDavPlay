import {Request, Router} from 'express';

export type AppRouter = {
  path: string;
  router: Router;
};

export type AppRequest<
  Params = Record<string, unknown>,
  ResponseBody = Record<string, unknown>,
  RequestBody = Record<string, unknown>,
  RequestQuery = qs.ParsedQs
> = Request<Params, ResponseBody, RequestBody, RequestQuery>;

export type Result<T, E = Error> = {ok: true; value: T} | {ok: false; error: E};
