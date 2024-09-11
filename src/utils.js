import fs from "fs";
import isValidDomain from "is-valid-domain";
import path from "path";

export function parseProxy(proxy) {
  let protocol = "http";

  // 如果没有传入协议，默认使用http
  if (/^https?:\/\//.test(proxy)) {
    protocol = proxy.split("://")[0];
  }

  // 判断格式是 user:password@host:port 还是 host:port:user:password
  let auth = proxy.match(/@/g);
  let host = proxy;
  let username = "";
  let password = "";
  let port = 80;

  if (auth && auth.length === 1) {
    let [authInfo, hostInfo] = proxy.split("@");
    [username, password] = authInfo.split(":");
    host = hostInfo;
  }

  let hostInfo = host.split(":");

  if (hostInfo.length === 2) {
    [host, port] = hostInfo;
  } else if (hostInfo.length === 4) {
    [host, port, username, password] = hostInfo;
  }

  return {
    protocol,
    host,
    port,
    username,
    password,
  };
}

export function parseDomain(domain) {
  let protocol = "http";
  let host = domain;
  let port = 80;

  if (/^https?:\/\//.test(domain)) {
    protocol = domain.split("://")[0];
    host = domain.split("://")[1];
  }

  let hostInfo = host.split(":");

  if (hostInfo.length === 2) {
    [host, port] = hostInfo;
  }

  return {
    protocol,
    host,
    port,
  };
}

export function isProxy(proxy) {
  if (checkFileExists(proxy)) {
    return false;
  }

  const regex =
    /^(https?:\/\/)?(([a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)?@)?([a-zA-Z0-9.-]+):\d+(:[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+)?$/;

  return regex.test(proxy);
}

export function isDomain(domain) {
  if (checkFileExists(domain)) {
    return false;
  }

  return isValidDomain(domain);
}

export function getProxiesFromFile(filePath) {
  let proxies = [];
  let __dirname = process.cwd();
  try {
    let data = fs.readFileSync(path.join(__dirname, filePath), "utf-8");
    proxies = data.split("\n").filter((proxy) => isProxy(proxy));
  } catch (e) {
    console.error(e);
  }
  return proxies;
}

export function getDomainsFromFile(filePath) {
  let domains = [];
  let __dirname = process.cwd();
  try {
    let data = fs.readFileSync(path.join(__dirname, filePath), "utf-8");
    domains = data.split("\n").filter((domain) => domain);
  } catch (e) {
    console.error(e);
  }
  return domains;
}

export function checkFileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
