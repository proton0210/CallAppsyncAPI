import { SignatureV4 } from "@aws-sdk/signature-v4";
import "cross-fetch/polyfill";
import fetch from "node-fetch";
import { URL } from "url";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Hash } from "@aws-sdk/hash-node";
import { HttpRequest } from "@aws-sdk/protocol-http";

async function callAppSyncAPI(
  api_url: string,
  region: string,
  query: string,
  operationName: string,
  variables: Record<string, any>
): Promise<any> {
  try {
    const body = {
      query: query,
      operationName: operationName,
      variables: variables,
      authMode: "AWS_IAM",
    };

    const url = new URL(api_url);

    const httpRequest = new HttpRequest({
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/graphql",
        host: url.hostname,
      },
      hostname: url.hostname,
      method: "POST",
      path: url.pathname,
      protocol: url.protocol,
      query: {},
    });

    const signer = new SignatureV4({
      credentials: defaultProvider(),
      service: "appsync",
      region: region,
      sha256: Hash.bind(null, "sha256"),
    });

    const req = await signer.sign(httpRequest);

    const res = await fetch(`${req.protocol}//${req.hostname}${req.path}`, {
      method: req.method,
      body: req.body,
      headers: req.headers,
    });

    if (!res.ok) {
      throw new Error("Failed");
    }

    return res.json();
  } catch (error) {
    throw error;
  }
}
