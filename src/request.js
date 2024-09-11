import { HttpsProxyAgent } from "https-proxy-agent";
import { HttpProxyAgent } from "http-proxy-agent";
import { parseDomain, parseProxy } from "./utils.js";

export function requestWithPorxy(url, options) {
  const { proxy, timeout = 3000, ...opts } = options;

  let { protocol, host, port, username, password } = parseProxy(proxy);
  let { protocol: domainProtocol, host: domainHost } = parseDomain(url);

  const ProxyAgent =
    domainProtocol === "http" ? HttpProxyAgent : HttpsProxyAgent;

  return Promise.race([
    fetch(`${domainProtocol}://${domainHost}`, {
      ...opts,
      agent: new ProxyAgent(
        `${protocol}://${username}:${password}@${host}:${port}`
      ),
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), timeout)
    ),
  ]);
}
