import http from "http";
import { RequestObjectProps, RequestObject } from "../";

export = class RequestHelper {
  obj(req: http.IncomingMessage, props: RequestObjectProps): RequestObject {
    return Object.assign(req, props);
  }

  props(params: RegExpExecArray | null, body: any, query: string): RequestObjectProps {
    return { params: params?.groups, body, query: this.createQueryObject(query) };
  }

  private createQueryObject(query: string): { [key: string]: string } | {} {
    const noQuestionMark = query.substring(1);
    const queries = noQuestionMark.split("&").filter((quer) => quer);
    const queryObject = queries.reduce((acc: { [key: string]: string }, cur): { [key: string]: string } => {
      if (cur.includes("=")) {
        const [key, value] = cur.split("=");
        acc[key] = value;
      } else {
        acc[cur] = "";
      }

      return acc;
    }, {});

    return queryObject;
  }
};
