import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import colors from "colors";
import loading from "loading-cli";
import fs from "fs";
import { requestWithPorxy } from "./request.js";
import {
  getDomainsFromFile,
  getProxiesFromFile,
  isDomain,
  isProxy,
} from "./utils.js";

// 获取输入的参数
const argv = yargs(hideBin(process.argv))
  .option("proxy", {
    alias: "p",
    describe: `需要代理的地址，可以是文件路径`,
    type: "string",
    demandOption: true,
  })
  .option("domain", {
    alias: "d",
    describe: "需要测试的域名，可以是文件路径",
    type: "string",
    demandOption: true,
  })
  .option("output", {
    alias: "o",
    describe: "测试结果输出的文件路径",
    type: "string",
  })
  .option("timeout", {
    alias: "t",
    describe: "超时时间[ms], 默认3000ms",
    type: "number",
    default: 3000,
  })
  .help()
  .alias("h", "help")
  .alias("v", "version")
  .example("proxy-tester-cli -p host:port:user:pass -d www.example.com")
  .version()
  .parse();

(async () => {
  const { proxy, domain, output, timeout } = argv;

  let result = [];
  let proxies = [];
  let domains = [];

  const success = colors.green;
  const warning = colors.yellow;
  const error = colors.red;

  if (!isProxy(proxy)) {
    proxies = getProxiesFromFile(proxy);
  } else {
    proxies.push(proxy);
  }

  if (!isDomain(domain)) {
    domains = getDomainsFromFile(domain);
  } else {
    domains.push(domain);
  }

  for (let domain of domains) {
    for (let proxy of proxies) {
      const load = loading(domain).start();
      try {
        const res = await requestWithPorxy(domain, { proxy, timeout });
        result.push({
          proxy,
          domain,
          status: res.status,
          statusText: res.statusText,
        });

        const statusCode = res.status.toString();
        const statusText = res.statusText.toUpperCase();
        load.stop();

        if (/2\d{2}/.test(statusCode)) {
          console.log(success(statusCode + " " + statusText), "\t", domain);
        } else if (/3\d{2}/.test(statusCode)) {
          console.log(warning(statusCode + " " + statusText), "\t", domain);
        } else {
          console.log(error(statusCode + " " + statusText), "\t", domain);
        }
      } catch (e) {
        load.stop();
        if (e.cause) {
          console.log(
            error("ERR" + " " + e.cause.code.toUpperCase()),
            "\t",
            domain
          );
        } else {
          console.log(
            error("ERR" + " " + e.message.toUpperCase()),
            "\t",
            domain
          );
        }
      }
    }
  }

  let group = result.reduce((acc, res) => {
    if (!acc[res.proxy]) {
      acc[res.proxy] = [];
    }
    acc[res.proxy].push(res);
    return acc;
  }, {});

  if (output) {
    fs.writeFileSync(
      output,
      Object.entries(group)
        .map(([proxy, res]) => {
          const d = res
            .map(
              ({ status, statusText, domain }) =>
                `${status} ${statusText}\t${domain}`
            )
            .join("\n");

          return `--- [${proxy}]\n${d}`;
        })
        .join("\n\n")
    );
  }
  process.exit(0);
})();
