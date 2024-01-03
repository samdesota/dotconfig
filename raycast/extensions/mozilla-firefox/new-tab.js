"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function checkPathExt(path, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path, options);
    }
    function isexe(path, options, cb) {
      fs.stat(path, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path, options));
      });
    }
    function sync(path, options) {
      return checkStat(fs.statSync(path), path, options);
    }
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function isexe(path, options, cb) {
      fs.stat(path, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    function sync(path, options) {
      return checkStat(fs.statSync(path), options);
    }
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports, module2) {
    var fs = require("fs");
    var core;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core = require_windows();
    } else {
      core = require_mode();
    }
    module2.exports = isexe;
    isexe.sync = sync;
    function isexe(path, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core(path, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path, options) {
      try {
        return core.sync(path, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/which/which.js"(exports, module2) {
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path = require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    var getNotFoundError = (cmd) => Object.assign(new Error(`not found: ${cmd}`), { code: "ENOENT" });
    var getPathInfo = (cmd, opt) => {
      const colon = opt.colon || COLON;
      const pathEnv = cmd.match(/\//) || isWindows && cmd.match(/\\/) ? [""] : [
        // windows always checks the cwd first
        ...isWindows ? [process.cwd()] : [],
        ...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */
        "").split(colon)
      ];
      const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
      const pathExt = isWindows ? pathExtExe.split(colon) : [""];
      if (isWindows) {
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      return {
        pathEnv,
        pathExt,
        pathExtExe
      };
    };
    var which = (cmd, opt, cb) => {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      if (!opt)
        opt = {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      const step = (i) => new Promise((resolve, reject) => {
        if (i === pathEnv.length)
          return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd));
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        resolve(subStep(p, i, 0));
      });
      const subStep = (p, i, ii) => new Promise((resolve, reject) => {
        if (ii === pathExt.length)
          return resolve(step(i + 1));
        const ext = pathExt[ii];
        isexe(p + ext, { pathExt: pathExtExe }, (er, is) => {
          if (!er && is) {
            if (opt.all)
              found.push(p + ext);
            else
              return resolve(p + ext);
          }
          return resolve(subStep(p, i, ii + 1));
        });
      });
      return cb ? step(0).then((res) => cb(null, res), cb) : step(0);
    };
    var whichSync = (cmd, opt) => {
      opt = opt || {};
      const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt);
      const found = [];
      for (let i = 0; i < pathEnv.length; i++) {
        const ppRaw = pathEnv[i];
        const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw;
        const pCmd = path.join(pathPart, cmd);
        const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd;
        for (let j = 0; j < pathExt.length; j++) {
          const cur = p + pathExt[j];
          try {
            const is = isexe.sync(cur, { pathExt: pathExtExe });
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    };
    module2.exports = which;
    which.sync = whichSync;
  }
});

// node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/path-key/index.js"(exports, module2) {
    "use strict";
    var pathKey = (options = {}) => {
      const environment = options.env || process.env;
      const platform = options.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(environment).reverse().find((key) => key.toUpperCase() === "PATH") || "Path";
    };
    module2.exports = pathKey;
    module2.exports.default = pathKey;
  }
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/cross-spawn/lib/util/resolveCommand.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var which = require_which();
    var getPathKey = require_path_key();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const env = parsed.options.env || process.env;
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      const shouldSwitchCwd = hasCustomCwd && process.chdir !== void 0 && !process.chdir.disabled;
      if (shouldSwitchCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: env[getPathKey({ env })],
          pathExt: withoutPathExt ? path.delimiter : void 0
        });
      } catch (e) {
      } finally {
        if (shouldSwitchCwd) {
          process.chdir(cwd);
        }
      }
      if (resolved) {
        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module2.exports = resolveCommand;
  }
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/cross-spawn/lib/util/escape.js"(exports, module2) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(\\*)"/g, '$1$1\\"');
      arg = arg.replace(/(\\*)$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    module2.exports.command = escapeCommand;
    module2.exports.argument = escapeArgument;
  }
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/shebang-regex/index.js"(exports, module2) {
    "use strict";
    module2.exports = /^#!(.*)/;
  }
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports, module2) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module2.exports = (string = "") => {
      const match = string.match(shebangRegex);
      if (!match) {
        return null;
      }
      const [path, argument] = match[0].replace(/#! ?/, "").split(" ");
      const binary = path.split("/").pop();
      if (binary === "env") {
        return argument;
      }
      return argument ? `${binary} ${argument}` : binary;
    };
  }
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      const buffer = Buffer.alloc(size);
      let fd;
      try {
        fd = fs.openSync(command, "r");
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/cross-spawn/lib/parse.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parse(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parsed : parseNonShell(parsed);
    }
    module2.exports = parse;
  }
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/cross-spawn/lib/enoent.js"(exports, module2) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed, "spawn");
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module2.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports, module2) {
    "use strict";
    var cp = require("child_process");
    var parse = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options) {
      const parsed = parse(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options) {
      const parsed = parse(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn;
    module2.exports.spawn = spawn;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse;
    module2.exports._enoent = enoent;
  }
});

// node_modules/strip-final-newline/index.js
var require_strip_final_newline = __commonJS({
  "node_modules/strip-final-newline/index.js"(exports, module2) {
    "use strict";
    module2.exports = (input) => {
      const LF = typeof input === "string" ? "\n" : "\n".charCodeAt();
      const CR = typeof input === "string" ? "\r" : "\r".charCodeAt();
      if (input[input.length - 1] === LF) {
        input = input.slice(0, input.length - 1);
      }
      if (input[input.length - 1] === CR) {
        input = input.slice(0, input.length - 1);
      }
      return input;
    };
  }
});

// node_modules/npm-run-path/index.js
var require_npm_run_path = __commonJS({
  "node_modules/npm-run-path/index.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var pathKey = require_path_key();
    var npmRunPath = (options) => {
      options = {
        cwd: process.cwd(),
        path: process.env[pathKey()],
        execPath: process.execPath,
        ...options
      };
      let previous;
      let cwdPath = path.resolve(options.cwd);
      const result = [];
      while (previous !== cwdPath) {
        result.push(path.join(cwdPath, "node_modules/.bin"));
        previous = cwdPath;
        cwdPath = path.resolve(cwdPath, "..");
      }
      const execPathDir = path.resolve(options.cwd, options.execPath, "..");
      result.push(execPathDir);
      return result.concat(options.path).join(path.delimiter);
    };
    module2.exports = npmRunPath;
    module2.exports.default = npmRunPath;
    module2.exports.env = (options) => {
      options = {
        env: process.env,
        ...options
      };
      const env = { ...options.env };
      const path2 = pathKey({ env });
      options.path = env[path2];
      env[path2] = module2.exports(options);
      return env;
    };
  }
});

// node_modules/mimic-fn/index.js
var require_mimic_fn = __commonJS({
  "node_modules/mimic-fn/index.js"(exports, module2) {
    "use strict";
    var mimicFn = (to, from) => {
      for (const prop of Reflect.ownKeys(from)) {
        Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
      }
      return to;
    };
    module2.exports = mimicFn;
    module2.exports.default = mimicFn;
  }
});

// node_modules/onetime/index.js
var require_onetime = __commonJS({
  "node_modules/onetime/index.js"(exports, module2) {
    "use strict";
    var mimicFn = require_mimic_fn();
    var calledFunctions = /* @__PURE__ */ new WeakMap();
    var onetime = (function_, options = {}) => {
      if (typeof function_ !== "function") {
        throw new TypeError("Expected a function");
      }
      let returnValue;
      let callCount = 0;
      const functionName = function_.displayName || function_.name || "<anonymous>";
      const onetime2 = function(...arguments_) {
        calledFunctions.set(onetime2, ++callCount);
        if (callCount === 1) {
          returnValue = function_.apply(this, arguments_);
          function_ = null;
        } else if (options.throw === true) {
          throw new Error(`Function \`${functionName}\` can only be called once`);
        }
        return returnValue;
      };
      mimicFn(onetime2, function_);
      calledFunctions.set(onetime2, callCount);
      return onetime2;
    };
    module2.exports = onetime;
    module2.exports.default = onetime;
    module2.exports.callCount = (function_) => {
      if (!calledFunctions.has(function_)) {
        throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
      }
      return calledFunctions.get(function_);
    };
  }
});

// node_modules/human-signals/build/src/core.js
var require_core = __commonJS({
  "node_modules/human-signals/build/src/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SIGNALS = void 0;
    var SIGNALS = [
      {
        name: "SIGHUP",
        number: 1,
        action: "terminate",
        description: "Terminal closed",
        standard: "posix"
      },
      {
        name: "SIGINT",
        number: 2,
        action: "terminate",
        description: "User interruption with CTRL-C",
        standard: "ansi"
      },
      {
        name: "SIGQUIT",
        number: 3,
        action: "core",
        description: "User interruption with CTRL-\\",
        standard: "posix"
      },
      {
        name: "SIGILL",
        number: 4,
        action: "core",
        description: "Invalid machine instruction",
        standard: "ansi"
      },
      {
        name: "SIGTRAP",
        number: 5,
        action: "core",
        description: "Debugger breakpoint",
        standard: "posix"
      },
      {
        name: "SIGABRT",
        number: 6,
        action: "core",
        description: "Aborted",
        standard: "ansi"
      },
      {
        name: "SIGIOT",
        number: 6,
        action: "core",
        description: "Aborted",
        standard: "bsd"
      },
      {
        name: "SIGBUS",
        number: 7,
        action: "core",
        description: "Bus error due to misaligned, non-existing address or paging error",
        standard: "bsd"
      },
      {
        name: "SIGEMT",
        number: 7,
        action: "terminate",
        description: "Command should be emulated but is not implemented",
        standard: "other"
      },
      {
        name: "SIGFPE",
        number: 8,
        action: "core",
        description: "Floating point arithmetic error",
        standard: "ansi"
      },
      {
        name: "SIGKILL",
        number: 9,
        action: "terminate",
        description: "Forced termination",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGUSR1",
        number: 10,
        action: "terminate",
        description: "Application-specific signal",
        standard: "posix"
      },
      {
        name: "SIGSEGV",
        number: 11,
        action: "core",
        description: "Segmentation fault",
        standard: "ansi"
      },
      {
        name: "SIGUSR2",
        number: 12,
        action: "terminate",
        description: "Application-specific signal",
        standard: "posix"
      },
      {
        name: "SIGPIPE",
        number: 13,
        action: "terminate",
        description: "Broken pipe or socket",
        standard: "posix"
      },
      {
        name: "SIGALRM",
        number: 14,
        action: "terminate",
        description: "Timeout or timer",
        standard: "posix"
      },
      {
        name: "SIGTERM",
        number: 15,
        action: "terminate",
        description: "Termination",
        standard: "ansi"
      },
      {
        name: "SIGSTKFLT",
        number: 16,
        action: "terminate",
        description: "Stack is empty or overflowed",
        standard: "other"
      },
      {
        name: "SIGCHLD",
        number: 17,
        action: "ignore",
        description: "Child process terminated, paused or unpaused",
        standard: "posix"
      },
      {
        name: "SIGCLD",
        number: 17,
        action: "ignore",
        description: "Child process terminated, paused or unpaused",
        standard: "other"
      },
      {
        name: "SIGCONT",
        number: 18,
        action: "unpause",
        description: "Unpaused",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGSTOP",
        number: 19,
        action: "pause",
        description: "Paused",
        standard: "posix",
        forced: true
      },
      {
        name: "SIGTSTP",
        number: 20,
        action: "pause",
        description: 'Paused using CTRL-Z or "suspend"',
        standard: "posix"
      },
      {
        name: "SIGTTIN",
        number: 21,
        action: "pause",
        description: "Background process cannot read terminal input",
        standard: "posix"
      },
      {
        name: "SIGBREAK",
        number: 21,
        action: "terminate",
        description: "User interruption with CTRL-BREAK",
        standard: "other"
      },
      {
        name: "SIGTTOU",
        number: 22,
        action: "pause",
        description: "Background process cannot write to terminal output",
        standard: "posix"
      },
      {
        name: "SIGURG",
        number: 23,
        action: "ignore",
        description: "Socket received out-of-band data",
        standard: "bsd"
      },
      {
        name: "SIGXCPU",
        number: 24,
        action: "core",
        description: "Process timed out",
        standard: "bsd"
      },
      {
        name: "SIGXFSZ",
        number: 25,
        action: "core",
        description: "File too big",
        standard: "bsd"
      },
      {
        name: "SIGVTALRM",
        number: 26,
        action: "terminate",
        description: "Timeout or timer",
        standard: "bsd"
      },
      {
        name: "SIGPROF",
        number: 27,
        action: "terminate",
        description: "Timeout or timer",
        standard: "bsd"
      },
      {
        name: "SIGWINCH",
        number: 28,
        action: "ignore",
        description: "Terminal window size changed",
        standard: "bsd"
      },
      {
        name: "SIGIO",
        number: 29,
        action: "terminate",
        description: "I/O is available",
        standard: "other"
      },
      {
        name: "SIGPOLL",
        number: 29,
        action: "terminate",
        description: "Watched event",
        standard: "other"
      },
      {
        name: "SIGINFO",
        number: 29,
        action: "ignore",
        description: "Request for process information",
        standard: "other"
      },
      {
        name: "SIGPWR",
        number: 30,
        action: "terminate",
        description: "Device running out of power",
        standard: "systemv"
      },
      {
        name: "SIGSYS",
        number: 31,
        action: "core",
        description: "Invalid system call",
        standard: "other"
      },
      {
        name: "SIGUNUSED",
        number: 31,
        action: "terminate",
        description: "Invalid system call",
        standard: "other"
      }
    ];
    exports.SIGNALS = SIGNALS;
  }
});

// node_modules/human-signals/build/src/realtime.js
var require_realtime = __commonJS({
  "node_modules/human-signals/build/src/realtime.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SIGRTMAX = exports.getRealtimeSignals = void 0;
    var getRealtimeSignals = function() {
      const length = SIGRTMAX - SIGRTMIN + 1;
      return Array.from({ length }, getRealtimeSignal);
    };
    exports.getRealtimeSignals = getRealtimeSignals;
    var getRealtimeSignal = function(value, index) {
      return {
        name: `SIGRT${index + 1}`,
        number: SIGRTMIN + index,
        action: "terminate",
        description: "Application-specific signal (realtime)",
        standard: "posix"
      };
    };
    var SIGRTMIN = 34;
    var SIGRTMAX = 64;
    exports.SIGRTMAX = SIGRTMAX;
  }
});

// node_modules/human-signals/build/src/signals.js
var require_signals = __commonJS({
  "node_modules/human-signals/build/src/signals.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSignals = void 0;
    var _os = require("os");
    var _core = require_core();
    var _realtime = require_realtime();
    var getSignals = function() {
      const realtimeSignals = (0, _realtime.getRealtimeSignals)();
      const signals = [..._core.SIGNALS, ...realtimeSignals].map(normalizeSignal);
      return signals;
    };
    exports.getSignals = getSignals;
    var normalizeSignal = function({
      name,
      number: defaultNumber,
      description,
      action,
      forced = false,
      standard
    }) {
      const {
        signals: { [name]: constantSignal }
      } = _os.constants;
      const supported = constantSignal !== void 0;
      const number = supported ? constantSignal : defaultNumber;
      return { name, number, description, supported, action, forced, standard };
    };
  }
});

// node_modules/human-signals/build/src/main.js
var require_main = __commonJS({
  "node_modules/human-signals/build/src/main.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.signalsByNumber = exports.signalsByName = void 0;
    var _os = require("os");
    var _signals = require_signals();
    var _realtime = require_realtime();
    var getSignalsByName = function() {
      const signals = (0, _signals.getSignals)();
      return signals.reduce(getSignalByName, {});
    };
    var getSignalByName = function(signalByNameMemo, { name, number, description, supported, action, forced, standard }) {
      return {
        ...signalByNameMemo,
        [name]: { name, number, description, supported, action, forced, standard }
      };
    };
    var signalsByName = getSignalsByName();
    exports.signalsByName = signalsByName;
    var getSignalsByNumber = function() {
      const signals = (0, _signals.getSignals)();
      const length = _realtime.SIGRTMAX + 1;
      const signalsA = Array.from({ length }, (value, number) => getSignalByNumber(number, signals));
      return Object.assign({}, ...signalsA);
    };
    var getSignalByNumber = function(number, signals) {
      const signal = findSignalByNumber(number, signals);
      if (signal === void 0) {
        return {};
      }
      const { name, description, supported, action, forced, standard } = signal;
      return {
        [number]: {
          name,
          number,
          description,
          supported,
          action,
          forced,
          standard
        }
      };
    };
    var findSignalByNumber = function(number, signals) {
      const signal = signals.find(({ name }) => _os.constants.signals[name] === number);
      if (signal !== void 0) {
        return signal;
      }
      return signals.find((signalA) => signalA.number === number);
    };
    var signalsByNumber = getSignalsByNumber();
    exports.signalsByNumber = signalsByNumber;
  }
});

// node_modules/execa/lib/error.js
var require_error = __commonJS({
  "node_modules/execa/lib/error.js"(exports, module2) {
    "use strict";
    var { signalsByName } = require_main();
    var getErrorPrefix = ({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled }) => {
      if (timedOut) {
        return `timed out after ${timeout} milliseconds`;
      }
      if (isCanceled) {
        return "was canceled";
      }
      if (errorCode !== void 0) {
        return `failed with ${errorCode}`;
      }
      if (signal !== void 0) {
        return `was killed with ${signal} (${signalDescription})`;
      }
      if (exitCode !== void 0) {
        return `failed with exit code ${exitCode}`;
      }
      return "failed";
    };
    var makeError = ({
      stdout,
      stderr,
      all,
      error,
      signal,
      exitCode,
      command,
      escapedCommand,
      timedOut,
      isCanceled,
      killed,
      parsed: { options: { timeout } }
    }) => {
      exitCode = exitCode === null ? void 0 : exitCode;
      signal = signal === null ? void 0 : signal;
      const signalDescription = signal === void 0 ? void 0 : signalsByName[signal].description;
      const errorCode = error && error.code;
      const prefix = getErrorPrefix({ timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled });
      const execaMessage = `Command ${prefix}: ${command}`;
      const isError = Object.prototype.toString.call(error) === "[object Error]";
      const shortMessage = isError ? `${execaMessage}
${error.message}` : execaMessage;
      const message = [shortMessage, stderr, stdout].filter(Boolean).join("\n");
      if (isError) {
        error.originalMessage = error.message;
        error.message = message;
      } else {
        error = new Error(message);
      }
      error.shortMessage = shortMessage;
      error.command = command;
      error.escapedCommand = escapedCommand;
      error.exitCode = exitCode;
      error.signal = signal;
      error.signalDescription = signalDescription;
      error.stdout = stdout;
      error.stderr = stderr;
      if (all !== void 0) {
        error.all = all;
      }
      if ("bufferedData" in error) {
        delete error.bufferedData;
      }
      error.failed = true;
      error.timedOut = Boolean(timedOut);
      error.isCanceled = isCanceled;
      error.killed = killed && !timedOut;
      return error;
    };
    module2.exports = makeError;
  }
});

// node_modules/execa/lib/stdio.js
var require_stdio = __commonJS({
  "node_modules/execa/lib/stdio.js"(exports, module2) {
    "use strict";
    var aliases = ["stdin", "stdout", "stderr"];
    var hasAlias = (options) => aliases.some((alias) => options[alias] !== void 0);
    var normalizeStdio = (options) => {
      if (!options) {
        return;
      }
      const { stdio } = options;
      if (stdio === void 0) {
        return aliases.map((alias) => options[alias]);
      }
      if (hasAlias(options)) {
        throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map((alias) => `\`${alias}\``).join(", ")}`);
      }
      if (typeof stdio === "string") {
        return stdio;
      }
      if (!Array.isArray(stdio)) {
        throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
      }
      const length = Math.max(stdio.length, aliases.length);
      return Array.from({ length }, (value, index) => stdio[index]);
    };
    module2.exports = normalizeStdio;
    module2.exports.node = (options) => {
      const stdio = normalizeStdio(options);
      if (stdio === "ipc") {
        return "ipc";
      }
      if (stdio === void 0 || typeof stdio === "string") {
        return [stdio, stdio, stdio, "ipc"];
      }
      if (stdio.includes("ipc")) {
        return stdio;
      }
      return [...stdio, "ipc"];
    };
  }
});

// node_modules/signal-exit/signals.js
var require_signals2 = __commonJS({
  "node_modules/signal-exit/signals.js"(exports, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push(
        "SIGVTALRM",
        "SIGXCPU",
        "SIGXFSZ",
        "SIGUSR2",
        "SIGTRAP",
        "SIGSYS",
        "SIGQUIT",
        "SIGIOT"
        // should detect profiler and enable/disable accordingly.
        // see #21
        // 'SIGPROF'
      );
    }
    if (process.platform === "linux") {
      module2.exports.push(
        "SIGIO",
        "SIGPOLL",
        "SIGPWR",
        "SIGSTKFLT",
        "SIGUNUSED"
      );
    }
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/signal-exit/index.js"(exports, module2) {
    var process2 = global.process;
    var processOk = function(process3) {
      return process3 && typeof process3 === "object" && typeof process3.removeListener === "function" && typeof process3.emit === "function" && typeof process3.reallyExit === "function" && typeof process3.listeners === "function" && typeof process3.kill === "function" && typeof process3.pid === "number" && typeof process3.on === "function";
    };
    if (!processOk(process2)) {
      module2.exports = function() {
        return function() {
        };
      };
    } else {
      assert = require("assert");
      signals = require_signals2();
      isWin = /^win/i.test(process2.platform);
      EE = require("events");
      if (typeof EE !== "function") {
        EE = EE.EventEmitter;
      }
      if (process2.__signal_exit_emitter__) {
        emitter = process2.__signal_exit_emitter__;
      } else {
        emitter = process2.__signal_exit_emitter__ = new EE();
        emitter.count = 0;
        emitter.emitted = {};
      }
      if (!emitter.infinite) {
        emitter.setMaxListeners(Infinity);
        emitter.infinite = true;
      }
      module2.exports = function(cb, opts) {
        if (!processOk(global.process)) {
          return function() {
          };
        }
        assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
        if (loaded === false) {
          load();
        }
        var ev = "exit";
        if (opts && opts.alwaysLast) {
          ev = "afterexit";
        }
        var remove = function() {
          emitter.removeListener(ev, cb);
          if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
            unload();
          }
        };
        emitter.on(ev, cb);
        return remove;
      };
      unload = function unload2() {
        if (!loaded || !processOk(global.process)) {
          return;
        }
        loaded = false;
        signals.forEach(function(sig) {
          try {
            process2.removeListener(sig, sigListeners[sig]);
          } catch (er) {
          }
        });
        process2.emit = originalProcessEmit;
        process2.reallyExit = originalProcessReallyExit;
        emitter.count -= 1;
      };
      module2.exports.unload = unload;
      emit = function emit2(event, code, signal) {
        if (emitter.emitted[event]) {
          return;
        }
        emitter.emitted[event] = true;
        emitter.emit(event, code, signal);
      };
      sigListeners = {};
      signals.forEach(function(sig) {
        sigListeners[sig] = function listener() {
          if (!processOk(global.process)) {
            return;
          }
          var listeners = process2.listeners(sig);
          if (listeners.length === emitter.count) {
            unload();
            emit("exit", null, sig);
            emit("afterexit", null, sig);
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process2.kill(process2.pid, sig);
          }
        };
      });
      module2.exports.signals = function() {
        return signals;
      };
      loaded = false;
      load = function load2() {
        if (loaded || !processOk(global.process)) {
          return;
        }
        loaded = true;
        emitter.count += 1;
        signals = signals.filter(function(sig) {
          try {
            process2.on(sig, sigListeners[sig]);
            return true;
          } catch (er) {
            return false;
          }
        });
        process2.emit = processEmit;
        process2.reallyExit = processReallyExit;
      };
      module2.exports.load = load;
      originalProcessReallyExit = process2.reallyExit;
      processReallyExit = function processReallyExit2(code) {
        if (!processOk(global.process)) {
          return;
        }
        process2.exitCode = code || /* istanbul ignore next */
        0;
        emit("exit", process2.exitCode, null);
        emit("afterexit", process2.exitCode, null);
        originalProcessReallyExit.call(process2, process2.exitCode);
      };
      originalProcessEmit = process2.emit;
      processEmit = function processEmit2(ev, arg) {
        if (ev === "exit" && processOk(global.process)) {
          if (arg !== void 0) {
            process2.exitCode = arg;
          }
          var ret = originalProcessEmit.apply(this, arguments);
          emit("exit", process2.exitCode, null);
          emit("afterexit", process2.exitCode, null);
          return ret;
        } else {
          return originalProcessEmit.apply(this, arguments);
        }
      };
    }
    var assert;
    var signals;
    var isWin;
    var EE;
    var emitter;
    var unload;
    var emit;
    var sigListeners;
    var loaded;
    var load;
    var originalProcessReallyExit;
    var processReallyExit;
    var originalProcessEmit;
    var processEmit;
  }
});

// node_modules/execa/lib/kill.js
var require_kill = __commonJS({
  "node_modules/execa/lib/kill.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var onExit = require_signal_exit();
    var DEFAULT_FORCE_KILL_TIMEOUT = 1e3 * 5;
    var spawnedKill = (kill, signal = "SIGTERM", options = {}) => {
      const killResult = kill(signal);
      setKillTimeout(kill, signal, options, killResult);
      return killResult;
    };
    var setKillTimeout = (kill, signal, options, killResult) => {
      if (!shouldForceKill(signal, options, killResult)) {
        return;
      }
      const timeout = getForceKillAfterTimeout(options);
      const t = setTimeout(() => {
        kill("SIGKILL");
      }, timeout);
      if (t.unref) {
        t.unref();
      }
    };
    var shouldForceKill = (signal, { forceKillAfterTimeout }, killResult) => {
      return isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
    };
    var isSigterm = (signal) => {
      return signal === os.constants.signals.SIGTERM || typeof signal === "string" && signal.toUpperCase() === "SIGTERM";
    };
    var getForceKillAfterTimeout = ({ forceKillAfterTimeout = true }) => {
      if (forceKillAfterTimeout === true) {
        return DEFAULT_FORCE_KILL_TIMEOUT;
      }
      if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
        throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
      }
      return forceKillAfterTimeout;
    };
    var spawnedCancel = (spawned, context) => {
      const killResult = spawned.kill();
      if (killResult) {
        context.isCanceled = true;
      }
    };
    var timeoutKill = (spawned, signal, reject) => {
      spawned.kill(signal);
      reject(Object.assign(new Error("Timed out"), { timedOut: true, signal }));
    };
    var setupTimeout = (spawned, { timeout, killSignal = "SIGTERM" }, spawnedPromise) => {
      if (timeout === 0 || timeout === void 0) {
        return spawnedPromise;
      }
      let timeoutId;
      const timeoutPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          timeoutKill(spawned, killSignal, reject);
        }, timeout);
      });
      const safeSpawnedPromise = spawnedPromise.finally(() => {
        clearTimeout(timeoutId);
      });
      return Promise.race([timeoutPromise, safeSpawnedPromise]);
    };
    var validateTimeout = ({ timeout }) => {
      if (timeout !== void 0 && (!Number.isFinite(timeout) || timeout < 0)) {
        throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
      }
    };
    var setExitHandler = async (spawned, { cleanup, detached }, timedPromise) => {
      if (!cleanup || detached) {
        return timedPromise;
      }
      const removeExitHandler = onExit(() => {
        spawned.kill();
      });
      return timedPromise.finally(() => {
        removeExitHandler();
      });
    };
    module2.exports = {
      spawnedKill,
      spawnedCancel,
      setupTimeout,
      validateTimeout,
      setExitHandler
    };
  }
});

// node_modules/is-stream/index.js
var require_is_stream = __commonJS({
  "node_modules/is-stream/index.js"(exports, module2) {
    "use strict";
    var isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
    isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
    isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
    isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
    isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function";
    module2.exports = isStream;
  }
});

// node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/get-stream/buffer-stream.js"(exports, module2) {
    "use strict";
    var { PassThrough: PassThroughStream } = require("stream");
    module2.exports = (options) => {
      options = { ...options };
      const { array } = options;
      let { encoding } = options;
      const isBuffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || isBuffer);
      } else {
        encoding = encoding || "utf8";
      }
      if (isBuffer) {
        encoding = null;
      }
      const stream = new PassThroughStream({ objectMode });
      if (encoding) {
        stream.setEncoding(encoding);
      }
      let length = 0;
      const chunks = [];
      stream.on("data", (chunk) => {
        chunks.push(chunk);
        if (objectMode) {
          length = chunks.length;
        } else {
          length += chunk.length;
        }
      });
      stream.getBufferedValue = () => {
        if (array) {
          return chunks;
        }
        return isBuffer ? Buffer.concat(chunks, length) : chunks.join("");
      };
      stream.getBufferedLength = () => length;
      return stream;
    };
  }
});

// node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/get-stream/index.js"(exports, module2) {
    "use strict";
    var { constants: BufferConstants } = require("buffer");
    var stream = require("stream");
    var { promisify } = require("util");
    var bufferStream = require_buffer_stream();
    var streamPipelinePromisified = promisify(stream.pipeline);
    var MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    async function getStream(inputStream, options) {
      if (!inputStream) {
        throw new Error("Expected a stream");
      }
      options = {
        maxBuffer: Infinity,
        ...options
      };
      const { maxBuffer } = options;
      const stream2 = bufferStream(options);
      await new Promise((resolve, reject) => {
        const rejectPromise = (error) => {
          if (error && stream2.getBufferedLength() <= BufferConstants.MAX_LENGTH) {
            error.bufferedData = stream2.getBufferedValue();
          }
          reject(error);
        };
        (async () => {
          try {
            await streamPipelinePromisified(inputStream, stream2);
            resolve();
          } catch (error) {
            rejectPromise(error);
          }
        })();
        stream2.on("data", () => {
          if (stream2.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      });
      return stream2.getBufferedValue();
    }
    module2.exports = getStream;
    module2.exports.buffer = (stream2, options) => getStream(stream2, { ...options, encoding: "buffer" });
    module2.exports.array = (stream2, options) => getStream(stream2, { ...options, array: true });
    module2.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/merge-stream/index.js
var require_merge_stream = __commonJS({
  "node_modules/merge-stream/index.js"(exports, module2) {
    "use strict";
    var { PassThrough } = require("stream");
    module2.exports = function() {
      var sources = [];
      var output = new PassThrough({ objectMode: true });
      output.setMaxListeners(0);
      output.add = add;
      output.isEmpty = isEmpty;
      output.on("unpipe", remove);
      Array.prototype.slice.call(arguments).forEach(add);
      return output;
      function add(source) {
        if (Array.isArray(source)) {
          source.forEach(add);
          return this;
        }
        sources.push(source);
        source.once("end", remove.bind(null, source));
        source.once("error", output.emit.bind(output, "error"));
        source.pipe(output, { end: false });
        return this;
      }
      function isEmpty() {
        return sources.length == 0;
      }
      function remove(source) {
        sources = sources.filter(function(it) {
          return it !== source;
        });
        if (!sources.length && output.readable) {
          output.end();
        }
      }
    };
  }
});

// node_modules/execa/lib/stream.js
var require_stream = __commonJS({
  "node_modules/execa/lib/stream.js"(exports, module2) {
    "use strict";
    var isStream = require_is_stream();
    var getStream = require_get_stream();
    var mergeStream = require_merge_stream();
    var handleInput = (spawned, input) => {
      if (input === void 0 || spawned.stdin === void 0) {
        return;
      }
      if (isStream(input)) {
        input.pipe(spawned.stdin);
      } else {
        spawned.stdin.end(input);
      }
    };
    var makeAllStream = (spawned, { all }) => {
      if (!all || !spawned.stdout && !spawned.stderr) {
        return;
      }
      const mixed = mergeStream();
      if (spawned.stdout) {
        mixed.add(spawned.stdout);
      }
      if (spawned.stderr) {
        mixed.add(spawned.stderr);
      }
      return mixed;
    };
    var getBufferedData = async (stream, streamPromise) => {
      if (!stream) {
        return;
      }
      stream.destroy();
      try {
        return await streamPromise;
      } catch (error) {
        return error.bufferedData;
      }
    };
    var getStreamPromise = (stream, { encoding, buffer, maxBuffer }) => {
      if (!stream || !buffer) {
        return;
      }
      if (encoding) {
        return getStream(stream, { encoding, maxBuffer });
      }
      return getStream.buffer(stream, { maxBuffer });
    };
    var getSpawnedResult = async ({ stdout, stderr, all }, { encoding, buffer, maxBuffer }, processDone) => {
      const stdoutPromise = getStreamPromise(stdout, { encoding, buffer, maxBuffer });
      const stderrPromise = getStreamPromise(stderr, { encoding, buffer, maxBuffer });
      const allPromise = getStreamPromise(all, { encoding, buffer, maxBuffer: maxBuffer * 2 });
      try {
        return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
      } catch (error) {
        return Promise.all([
          { error, signal: error.signal, timedOut: error.timedOut },
          getBufferedData(stdout, stdoutPromise),
          getBufferedData(stderr, stderrPromise),
          getBufferedData(all, allPromise)
        ]);
      }
    };
    var validateInputSync = ({ input }) => {
      if (isStream(input)) {
        throw new TypeError("The `input` option cannot be a stream in sync mode");
      }
    };
    module2.exports = {
      handleInput,
      makeAllStream,
      getSpawnedResult,
      validateInputSync
    };
  }
});

// node_modules/execa/lib/promise.js
var require_promise = __commonJS({
  "node_modules/execa/lib/promise.js"(exports, module2) {
    "use strict";
    var nativePromisePrototype = (async () => {
    })().constructor.prototype;
    var descriptors = ["then", "catch", "finally"].map((property) => [
      property,
      Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
    ]);
    var mergePromise = (spawned, promise) => {
      for (const [property, descriptor] of descriptors) {
        const value = typeof promise === "function" ? (...args) => Reflect.apply(descriptor.value, promise(), args) : descriptor.value.bind(promise);
        Reflect.defineProperty(spawned, property, { ...descriptor, value });
      }
      return spawned;
    };
    var getSpawnedPromise = (spawned) => {
      return new Promise((resolve, reject) => {
        spawned.on("exit", (exitCode, signal) => {
          resolve({ exitCode, signal });
        });
        spawned.on("error", (error) => {
          reject(error);
        });
        if (spawned.stdin) {
          spawned.stdin.on("error", (error) => {
            reject(error);
          });
        }
      });
    };
    module2.exports = {
      mergePromise,
      getSpawnedPromise
    };
  }
});

// node_modules/execa/lib/command.js
var require_command = __commonJS({
  "node_modules/execa/lib/command.js"(exports, module2) {
    "use strict";
    var normalizeArgs = (file, args = []) => {
      if (!Array.isArray(args)) {
        return [file];
      }
      return [file, ...args];
    };
    var NO_ESCAPE_REGEXP = /^[\w.-]+$/;
    var DOUBLE_QUOTES_REGEXP = /"/g;
    var escapeArg = (arg) => {
      if (typeof arg !== "string" || NO_ESCAPE_REGEXP.test(arg)) {
        return arg;
      }
      return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
    };
    var joinCommand = (file, args) => {
      return normalizeArgs(file, args).join(" ");
    };
    var getEscapedCommand = (file, args) => {
      return normalizeArgs(file, args).map((arg) => escapeArg(arg)).join(" ");
    };
    var SPACES_REGEXP = / +/g;
    var parseCommand = (command) => {
      const tokens = [];
      for (const token of command.trim().split(SPACES_REGEXP)) {
        const previousToken = tokens[tokens.length - 1];
        if (previousToken && previousToken.endsWith("\\")) {
          tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
        } else {
          tokens.push(token);
        }
      }
      return tokens;
    };
    module2.exports = {
      joinCommand,
      getEscapedCommand,
      parseCommand
    };
  }
});

// node_modules/execa/index.js
var require_execa = __commonJS({
  "node_modules/execa/index.js"(exports, module2) {
    "use strict";
    var path = require("path");
    var childProcess = require("child_process");
    var crossSpawn = require_cross_spawn();
    var stripFinalNewline = require_strip_final_newline();
    var npmRunPath = require_npm_run_path();
    var onetime = require_onetime();
    var makeError = require_error();
    var normalizeStdio = require_stdio();
    var { spawnedKill, spawnedCancel, setupTimeout, validateTimeout, setExitHandler } = require_kill();
    var { handleInput, getSpawnedResult, makeAllStream, validateInputSync } = require_stream();
    var { mergePromise, getSpawnedPromise } = require_promise();
    var { joinCommand, parseCommand, getEscapedCommand } = require_command();
    var DEFAULT_MAX_BUFFER = 1e3 * 1e3 * 100;
    var getEnv = ({ env: envOption, extendEnv, preferLocal, localDir, execPath }) => {
      const env = extendEnv ? { ...process.env, ...envOption } : envOption;
      if (preferLocal) {
        return npmRunPath.env({ env, cwd: localDir, execPath });
      }
      return env;
    };
    var handleArguments = (file, args, options = {}) => {
      const parsed = crossSpawn._parse(file, args, options);
      file = parsed.command;
      args = parsed.args;
      options = parsed.options;
      options = {
        maxBuffer: DEFAULT_MAX_BUFFER,
        buffer: true,
        stripFinalNewline: true,
        extendEnv: true,
        preferLocal: false,
        localDir: options.cwd || process.cwd(),
        execPath: process.execPath,
        encoding: "utf8",
        reject: true,
        cleanup: true,
        all: false,
        windowsHide: true,
        ...options
      };
      options.env = getEnv(options);
      options.stdio = normalizeStdio(options);
      if (process.platform === "win32" && path.basename(file, ".exe") === "cmd") {
        args.unshift("/q");
      }
      return { file, args, options, parsed };
    };
    var handleOutput = (options, value, error) => {
      if (typeof value !== "string" && !Buffer.isBuffer(value)) {
        return error === void 0 ? void 0 : "";
      }
      if (options.stripFinalNewline) {
        return stripFinalNewline(value);
      }
      return value;
    };
    var execa2 = (file, args, options) => {
      const parsed = handleArguments(file, args, options);
      const command = joinCommand(file, args);
      const escapedCommand = getEscapedCommand(file, args);
      validateTimeout(parsed.options);
      let spawned;
      try {
        spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
      } catch (error) {
        const dummySpawned = new childProcess.ChildProcess();
        const errorPromise = Promise.reject(makeError({
          error,
          stdout: "",
          stderr: "",
          all: "",
          command,
          escapedCommand,
          parsed,
          timedOut: false,
          isCanceled: false,
          killed: false
        }));
        return mergePromise(dummySpawned, errorPromise);
      }
      const spawnedPromise = getSpawnedPromise(spawned);
      const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
      const processDone = setExitHandler(spawned, parsed.options, timedPromise);
      const context = { isCanceled: false };
      spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
      spawned.cancel = spawnedCancel.bind(null, spawned, context);
      const handlePromise = async () => {
        const [{ error, exitCode, signal, timedOut }, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
        const stdout = handleOutput(parsed.options, stdoutResult);
        const stderr = handleOutput(parsed.options, stderrResult);
        const all = handleOutput(parsed.options, allResult);
        if (error || exitCode !== 0 || signal !== null) {
          const returnedError = makeError({
            error,
            exitCode,
            signal,
            stdout,
            stderr,
            all,
            command,
            escapedCommand,
            parsed,
            timedOut,
            isCanceled: context.isCanceled,
            killed: spawned.killed
          });
          if (!parsed.options.reject) {
            return returnedError;
          }
          throw returnedError;
        }
        return {
          command,
          escapedCommand,
          exitCode: 0,
          stdout,
          stderr,
          all,
          failed: false,
          timedOut: false,
          isCanceled: false,
          killed: false
        };
      };
      const handlePromiseOnce = onetime(handlePromise);
      handleInput(spawned, parsed.options.input);
      spawned.all = makeAllStream(spawned, parsed.options);
      return mergePromise(spawned, handlePromiseOnce);
    };
    module2.exports = execa2;
    module2.exports.sync = (file, args, options) => {
      const parsed = handleArguments(file, args, options);
      const command = joinCommand(file, args);
      const escapedCommand = getEscapedCommand(file, args);
      validateInputSync(parsed.options);
      let result;
      try {
        result = childProcess.spawnSync(parsed.file, parsed.args, parsed.options);
      } catch (error) {
        throw makeError({
          error,
          stdout: "",
          stderr: "",
          all: "",
          command,
          escapedCommand,
          parsed,
          timedOut: false,
          isCanceled: false,
          killed: false
        });
      }
      const stdout = handleOutput(parsed.options, result.stdout, result.error);
      const stderr = handleOutput(parsed.options, result.stderr, result.error);
      if (result.error || result.status !== 0 || result.signal !== null) {
        const error = makeError({
          stdout,
          stderr,
          error: result.error,
          signal: result.signal,
          exitCode: result.status,
          command,
          escapedCommand,
          parsed,
          timedOut: result.error && result.error.code === "ETIMEDOUT",
          isCanceled: false,
          killed: result.signal !== null
        });
        if (!parsed.options.reject) {
          return error;
        }
        throw error;
      }
      return {
        command,
        escapedCommand,
        exitCode: 0,
        stdout,
        stderr,
        failed: false,
        timedOut: false,
        isCanceled: false,
        killed: false
      };
    };
    module2.exports.command = (command, options) => {
      const [file, ...args] = parseCommand(command);
      return execa2(file, args, options);
    };
    module2.exports.commandSync = (command, options) => {
      const [file, ...args] = parseCommand(command);
      return execa2.sync(file, args, options);
    };
    module2.exports.node = (scriptPath, args, options = {}) => {
      if (args && !Array.isArray(args) && typeof args === "object") {
        options = args;
        args = [];
      }
      const stdio = normalizeStdio.node(options);
      const defaultExecArgv = process.execArgv.filter((arg) => !arg.startsWith("--inspect"));
      const {
        nodePath = process.execPath,
        nodeOptions = defaultExecArgv
      } = options;
      return execa2(
        nodePath,
        [
          ...nodeOptions,
          scriptPath,
          ...Array.isArray(args) ? args : []
        ],
        {
          ...options,
          stdin: void 0,
          stdout: void 0,
          stderr: void 0,
          stdio,
          shell: false
        }
      );
    };
  }
});

// src/new-tab.tsx
var new_tab_exports = {};
__export(new_tab_exports, {
  default: () => Command
});
module.exports = __toCommonJS(new_tab_exports);

// src/actions/index.ts
var import_api = require("@raycast/api");

// node_modules/run-applescript/index.js
var import_execa = __toESM(require_execa(), 1);

// src/actions/index.ts
var import_child_process = require("child_process");
async function openNewTab(queryText) {
  return !queryText ? openHistoryTab("about:newtab") : openHistoryTab(`https://kagi.com/search?q=${encodeURIComponent(queryText)}`);
}
async function openHistoryTab(url) {
  (0, import_api.popToRoot)();
  (0, import_api.closeMainWindow)({ clearRootSearch: true });
  return new Promise((resolve, reject) => {
    const process2 = (0, import_child_process.exec)(`osascript -e 'tell application "Finder" to activate' && /Applications/Firefox.app/Contents/MacOS/firefox --browser`);
    process2.on("exit", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject("Failed to open url");
      }
    });
  });
}

// src/new-tab.tsx
async function Command() {
  openNewTab(null);
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2lzZXhlL3dpbmRvd3MuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2lzZXhlL21vZGUuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2lzZXhlL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy93aGljaC93aGljaC5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvcGF0aC1rZXkvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi91dGlsL3Jlc29sdmVDb21tYW5kLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9jcm9zcy1zcGF3bi9saWIvdXRpbC9lc2NhcGUuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL3NoZWJhbmctcmVnZXgvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL3NoZWJhbmctY29tbWFuZC9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL3V0aWwvcmVhZFNoZWJhbmcuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2Nyb3NzLXNwYXduL2xpYi9wYXJzZS5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vbGliL2Vub2VudC5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvY3Jvc3Mtc3Bhd24vaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL3N0cmlwLWZpbmFsLW5ld2xpbmUvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL25wbS1ydW4tcGF0aC9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvbWltaWMtZm4vaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL29uZXRpbWUvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvc3JjL2NvcmUuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvc3JjL3JlYWx0aW1lLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL3NyYy9zaWduYWxzLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL3NyYy9tYWluLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9leGVjYS9saWIvZXJyb3IuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdGRpby5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvc2lnbmFsLWV4aXQvc2lnbmFscy5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvc2lnbmFsLWV4aXQvaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9raWxsLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2dldC1zdHJlYW0vYnVmZmVyLXN0cmVhbS5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvZ2V0LXN0cmVhbS9pbmRleC5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvbWVyZ2Utc3RyZWFtL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9leGVjYS9saWIvc3RyZWFtLmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L25vZGVfbW9kdWxlcy9leGVjYS9saWIvcHJvbWlzZS5qcyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2NvbW1hbmQuanMiLCAiLi4vLi4vLi4vLi4vZC9yYXljYXN0LWZpcmVmb3gvZXh0ZW5zaW9ucy9tb3ppbGxhLWZpcmVmb3gvbm9kZV9tb2R1bGVzL2V4ZWNhL2luZGV4LmpzIiwgIi4uLy4uLy4uLy4uL2QvcmF5Y2FzdC1maXJlZm94L2V4dGVuc2lvbnMvbW96aWxsYS1maXJlZm94L3NyYy9uZXctdGFiLnRzeCIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9zcmMvYWN0aW9ucy9pbmRleC50cyIsICIuLi8uLi8uLi8uLi9kL3JheWNhc3QtZmlyZWZveC9leHRlbnNpb25zL21vemlsbGEtZmlyZWZveC9ub2RlX21vZHVsZXMvcnVuLWFwcGxlc2NyaXB0L2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGNoZWNrUGF0aEV4dCAocGF0aCwgb3B0aW9ucykge1xuICB2YXIgcGF0aGV4dCA9IG9wdGlvbnMucGF0aEV4dCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLnBhdGhFeHQgOiBwcm9jZXNzLmVudi5QQVRIRVhUXG5cbiAgaWYgKCFwYXRoZXh0KSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHBhdGhleHQgPSBwYXRoZXh0LnNwbGl0KCc7JylcbiAgaWYgKHBhdGhleHQuaW5kZXhPZignJykgIT09IC0xKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGhleHQubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcCA9IHBhdGhleHRbaV0udG9Mb3dlckNhc2UoKVxuICAgIGlmIChwICYmIHBhdGguc3Vic3RyKC1wLmxlbmd0aCkudG9Mb3dlckNhc2UoKSA9PT0gcCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgcGF0aCwgb3B0aW9ucykge1xuICBpZiAoIXN0YXQuaXNTeW1ib2xpY0xpbmsoKSAmJiAhc3RhdC5pc0ZpbGUoKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiBjaGVja1BhdGhFeHQocGF0aCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gaXNleGUgKHBhdGgsIG9wdGlvbnMsIGNiKSB7XG4gIGZzLnN0YXQocGF0aCwgZnVuY3Rpb24gKGVyLCBzdGF0KSB7XG4gICAgY2IoZXIsIGVyID8gZmFsc2UgOiBjaGVja1N0YXQoc3RhdCwgcGF0aCwgb3B0aW9ucykpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN5bmMgKHBhdGgsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNoZWNrU3RhdChmcy5zdGF0U3luYyhwYXRoKSwgcGF0aCwgb3B0aW9ucylcbn1cbiIsICJtb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG52YXIgZnMgPSByZXF1aXJlKCdmcycpXG5cbmZ1bmN0aW9uIGlzZXhlIChwYXRoLCBvcHRpb25zLCBjYikge1xuICBmcy5zdGF0KHBhdGgsIGZ1bmN0aW9uIChlciwgc3RhdCkge1xuICAgIGNiKGVyLCBlciA/IGZhbHNlIDogY2hlY2tTdGF0KHN0YXQsIG9wdGlvbnMpKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGVja1N0YXQoZnMuc3RhdFN5bmMocGF0aCksIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGNoZWNrU3RhdCAoc3RhdCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhdC5pc0ZpbGUoKSAmJiBjaGVja01vZGUoc3RhdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gY2hlY2tNb2RlIChzdGF0LCBvcHRpb25zKSB7XG4gIHZhciBtb2QgPSBzdGF0Lm1vZGVcbiAgdmFyIHVpZCA9IHN0YXQudWlkXG4gIHZhciBnaWQgPSBzdGF0LmdpZFxuXG4gIHZhciBteVVpZCA9IG9wdGlvbnMudWlkICE9PSB1bmRlZmluZWQgP1xuICAgIG9wdGlvbnMudWlkIDogcHJvY2Vzcy5nZXR1aWQgJiYgcHJvY2Vzcy5nZXR1aWQoKVxuICB2YXIgbXlHaWQgPSBvcHRpb25zLmdpZCAhPT0gdW5kZWZpbmVkID9cbiAgICBvcHRpb25zLmdpZCA6IHByb2Nlc3MuZ2V0Z2lkICYmIHByb2Nlc3MuZ2V0Z2lkKClcblxuICB2YXIgdSA9IHBhcnNlSW50KCcxMDAnLCA4KVxuICB2YXIgZyA9IHBhcnNlSW50KCcwMTAnLCA4KVxuICB2YXIgbyA9IHBhcnNlSW50KCcwMDEnLCA4KVxuICB2YXIgdWcgPSB1IHwgZ1xuXG4gIHZhciByZXQgPSAobW9kICYgbykgfHxcbiAgICAobW9kICYgZykgJiYgZ2lkID09PSBteUdpZCB8fFxuICAgIChtb2QgJiB1KSAmJiB1aWQgPT09IG15VWlkIHx8XG4gICAgKG1vZCAmIHVnKSAmJiBteVVpZCA9PT0gMFxuXG4gIHJldHVybiByZXRcbn1cbiIsICJ2YXIgZnMgPSByZXF1aXJlKCdmcycpXG52YXIgY29yZVxuaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHwgZ2xvYmFsLlRFU1RJTkdfV0lORE9XUykge1xuICBjb3JlID0gcmVxdWlyZSgnLi93aW5kb3dzLmpzJylcbn0gZWxzZSB7XG4gIGNvcmUgPSByZXF1aXJlKCcuL21vZGUuanMnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzZXhlXG5pc2V4ZS5zeW5jID0gc3luY1xuXG5mdW5jdGlvbiBpc2V4ZSAocGF0aCwgb3B0aW9ucywgY2IpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAoIWNiKSB7XG4gICAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYWxsYmFjayBub3QgcHJvdmlkZWQnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpc2V4ZShwYXRoLCBvcHRpb25zIHx8IHt9LCBmdW5jdGlvbiAoZXIsIGlzKSB7XG4gICAgICAgIGlmIChlcikge1xuICAgICAgICAgIHJlamVjdChlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKGlzKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBjb3JlKHBhdGgsIG9wdGlvbnMgfHwge30sIGZ1bmN0aW9uIChlciwgaXMpIHtcbiAgICAvLyBpZ25vcmUgRUFDQ0VTIGJlY2F1c2UgdGhhdCBqdXN0IG1lYW5zIHdlIGFyZW4ndCBhbGxvd2VkIHRvIHJ1biBpdFxuICAgIGlmIChlcikge1xuICAgICAgaWYgKGVyLmNvZGUgPT09ICdFQUNDRVMnIHx8IG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMpIHtcbiAgICAgICAgZXIgPSBudWxsXG4gICAgICAgIGlzID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgY2IoZXIsIGlzKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzeW5jIChwYXRoLCBvcHRpb25zKSB7XG4gIC8vIG15IGtpbmdkb20gZm9yIGEgZmlsdGVyZWQgY2F0Y2hcbiAgdHJ5IHtcbiAgICByZXR1cm4gY29yZS5zeW5jKHBhdGgsIG9wdGlvbnMgfHwge30pXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5pZ25vcmVFcnJvcnMgfHwgZXIuY29kZSA9PT0gJ0VBQ0NFUycpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlclxuICAgIH1cbiAgfVxufVxuIiwgImNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgfHxcbiAgICBwcm9jZXNzLmVudi5PU1RZUEUgPT09ICdjeWd3aW4nIHx8XG4gICAgcHJvY2Vzcy5lbnYuT1NUWVBFID09PSAnbXN5cydcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuY29uc3QgQ09MT04gPSBpc1dpbmRvd3MgPyAnOycgOiAnOidcbmNvbnN0IGlzZXhlID0gcmVxdWlyZSgnaXNleGUnKVxuXG5jb25zdCBnZXROb3RGb3VuZEVycm9yID0gKGNtZCkgPT5cbiAgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoYG5vdCBmb3VuZDogJHtjbWR9YCksIHsgY29kZTogJ0VOT0VOVCcgfSlcblxuY29uc3QgZ2V0UGF0aEluZm8gPSAoY21kLCBvcHQpID0+IHtcbiAgY29uc3QgY29sb24gPSBvcHQuY29sb24gfHwgQ09MT05cblxuICAvLyBJZiBpdCBoYXMgYSBzbGFzaCwgdGhlbiB3ZSBkb24ndCBib3RoZXIgc2VhcmNoaW5nIHRoZSBwYXRoZW52LlxuICAvLyBqdXN0IGNoZWNrIHRoZSBmaWxlIGl0c2VsZiwgYW5kIHRoYXQncyBpdC5cbiAgY29uc3QgcGF0aEVudiA9IGNtZC5tYXRjaCgvXFwvLykgfHwgaXNXaW5kb3dzICYmIGNtZC5tYXRjaCgvXFxcXC8pID8gWycnXVxuICAgIDogKFxuICAgICAgW1xuICAgICAgICAvLyB3aW5kb3dzIGFsd2F5cyBjaGVja3MgdGhlIGN3ZCBmaXJzdFxuICAgICAgICAuLi4oaXNXaW5kb3dzID8gW3Byb2Nlc3MuY3dkKCldIDogW10pLFxuICAgICAgICAuLi4ob3B0LnBhdGggfHwgcHJvY2Vzcy5lbnYuUEFUSCB8fFxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiB2ZXJ5IHVudXN1YWwgKi8gJycpLnNwbGl0KGNvbG9uKSxcbiAgICAgIF1cbiAgICApXG4gIGNvbnN0IHBhdGhFeHRFeGUgPSBpc1dpbmRvd3NcbiAgICA/IG9wdC5wYXRoRXh0IHx8IHByb2Nlc3MuZW52LlBBVEhFWFQgfHwgJy5FWEU7LkNNRDsuQkFUOy5DT00nXG4gICAgOiAnJ1xuICBjb25zdCBwYXRoRXh0ID0gaXNXaW5kb3dzID8gcGF0aEV4dEV4ZS5zcGxpdChjb2xvbikgOiBbJyddXG5cbiAgaWYgKGlzV2luZG93cykge1xuICAgIGlmIChjbWQuaW5kZXhPZignLicpICE9PSAtMSAmJiBwYXRoRXh0WzBdICE9PSAnJylcbiAgICAgIHBhdGhFeHQudW5zaGlmdCgnJylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aEVudixcbiAgICBwYXRoRXh0LFxuICAgIHBhdGhFeHRFeGUsXG4gIH1cbn1cblxuY29uc3Qgd2hpY2ggPSAoY21kLCBvcHQsIGNiKSA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2IgPSBvcHRcbiAgICBvcHQgPSB7fVxuICB9XG4gIGlmICghb3B0KVxuICAgIG9wdCA9IHt9XG5cbiAgY29uc3QgeyBwYXRoRW52LCBwYXRoRXh0LCBwYXRoRXh0RXhlIH0gPSBnZXRQYXRoSW5mbyhjbWQsIG9wdClcbiAgY29uc3QgZm91bmQgPSBbXVxuXG4gIGNvbnN0IHN0ZXAgPSBpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaSA9PT0gcGF0aEVudi5sZW5ndGgpXG4gICAgICByZXR1cm4gb3B0LmFsbCAmJiBmb3VuZC5sZW5ndGggPyByZXNvbHZlKGZvdW5kKVxuICAgICAgICA6IHJlamVjdChnZXROb3RGb3VuZEVycm9yKGNtZCkpXG5cbiAgICBjb25zdCBwcFJhdyA9IHBhdGhFbnZbaV1cbiAgICBjb25zdCBwYXRoUGFydCA9IC9eXCIuKlwiJC8udGVzdChwcFJhdykgPyBwcFJhdy5zbGljZSgxLCAtMSkgOiBwcFJhd1xuXG4gICAgY29uc3QgcENtZCA9IHBhdGguam9pbihwYXRoUGFydCwgY21kKVxuICAgIGNvbnN0IHAgPSAhcGF0aFBhcnQgJiYgL15cXC5bXFxcXFxcL10vLnRlc3QoY21kKSA/IGNtZC5zbGljZSgwLCAyKSArIHBDbWRcbiAgICAgIDogcENtZFxuXG4gICAgcmVzb2x2ZShzdWJTdGVwKHAsIGksIDApKVxuICB9KVxuXG4gIGNvbnN0IHN1YlN0ZXAgPSAocCwgaSwgaWkpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoaWkgPT09IHBhdGhFeHQubGVuZ3RoKVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3RlcChpICsgMSkpXG4gICAgY29uc3QgZXh0ID0gcGF0aEV4dFtpaV1cbiAgICBpc2V4ZShwICsgZXh0LCB7IHBhdGhFeHQ6IHBhdGhFeHRFeGUgfSwgKGVyLCBpcykgPT4ge1xuICAgICAgaWYgKCFlciAmJiBpcykge1xuICAgICAgICBpZiAob3B0LmFsbClcbiAgICAgICAgICBmb3VuZC5wdXNoKHAgKyBleHQpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShwICsgZXh0KVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoc3ViU3RlcChwLCBpLCBpaSArIDEpKVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGNiID8gc3RlcCgwKS50aGVuKHJlcyA9PiBjYihudWxsLCByZXMpLCBjYikgOiBzdGVwKDApXG59XG5cbmNvbnN0IHdoaWNoU3luYyA9IChjbWQsIG9wdCkgPT4ge1xuICBvcHQgPSBvcHQgfHwge31cblxuICBjb25zdCB7IHBhdGhFbnYsIHBhdGhFeHQsIHBhdGhFeHRFeGUgfSA9IGdldFBhdGhJbmZvKGNtZCwgb3B0KVxuICBjb25zdCBmb3VuZCA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoRW52Lmxlbmd0aDsgaSArKykge1xuICAgIGNvbnN0IHBwUmF3ID0gcGF0aEVudltpXVxuICAgIGNvbnN0IHBhdGhQYXJ0ID0gL15cIi4qXCIkLy50ZXN0KHBwUmF3KSA/IHBwUmF3LnNsaWNlKDEsIC0xKSA6IHBwUmF3XG5cbiAgICBjb25zdCBwQ21kID0gcGF0aC5qb2luKHBhdGhQYXJ0LCBjbWQpXG4gICAgY29uc3QgcCA9ICFwYXRoUGFydCAmJiAvXlxcLltcXFxcXFwvXS8udGVzdChjbWQpID8gY21kLnNsaWNlKDAsIDIpICsgcENtZFxuICAgICAgOiBwQ21kXG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBhdGhFeHQubGVuZ3RoOyBqICsrKSB7XG4gICAgICBjb25zdCBjdXIgPSBwICsgcGF0aEV4dFtqXVxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXMgPSBpc2V4ZS5zeW5jKGN1ciwgeyBwYXRoRXh0OiBwYXRoRXh0RXhlIH0pXG4gICAgICAgIGlmIChpcykge1xuICAgICAgICAgIGlmIChvcHQuYWxsKVxuICAgICAgICAgICAgZm91bmQucHVzaChjdXIpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGN1clxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChleCkge31cbiAgICB9XG4gIH1cblxuICBpZiAob3B0LmFsbCAmJiBmb3VuZC5sZW5ndGgpXG4gICAgcmV0dXJuIGZvdW5kXG5cbiAgaWYgKG9wdC5ub3Rocm93KVxuICAgIHJldHVybiBudWxsXG5cbiAgdGhyb3cgZ2V0Tm90Rm91bmRFcnJvcihjbWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2hpY2hcbndoaWNoLnN5bmMgPSB3aGljaFN5bmNcbiIsICIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHBhdGhLZXkgPSAob3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGVudmlyb25tZW50ID0gb3B0aW9ucy5lbnYgfHwgcHJvY2Vzcy5lbnY7XG5cdGNvbnN0IHBsYXRmb3JtID0gb3B0aW9ucy5wbGF0Zm9ybSB8fCBwcm9jZXNzLnBsYXRmb3JtO1xuXG5cdGlmIChwbGF0Zm9ybSAhPT0gJ3dpbjMyJykge1xuXHRcdHJldHVybiAnUEFUSCc7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0LmtleXMoZW52aXJvbm1lbnQpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhLZXk7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IHBhdGhLZXk7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3Qgd2hpY2ggPSByZXF1aXJlKCd3aGljaCcpO1xuY29uc3QgZ2V0UGF0aEtleSA9IHJlcXVpcmUoJ3BhdGgta2V5Jyk7XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kQXR0ZW1wdChwYXJzZWQsIHdpdGhvdXRQYXRoRXh0KSB7XG4gICAgY29uc3QgZW52ID0gcGFyc2VkLm9wdGlvbnMuZW52IHx8IHByb2Nlc3MuZW52O1xuICAgIGNvbnN0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG4gICAgY29uc3QgaGFzQ3VzdG9tQ3dkID0gcGFyc2VkLm9wdGlvbnMuY3dkICE9IG51bGw7XG4gICAgLy8gV29ya2VyIHRocmVhZHMgZG8gbm90IGhhdmUgcHJvY2Vzcy5jaGRpcigpXG4gICAgY29uc3Qgc2hvdWxkU3dpdGNoQ3dkID0gaGFzQ3VzdG9tQ3dkICYmIHByb2Nlc3MuY2hkaXIgIT09IHVuZGVmaW5lZCAmJiAhcHJvY2Vzcy5jaGRpci5kaXNhYmxlZDtcblxuICAgIC8vIElmIGEgY3VzdG9tIGBjd2RgIHdhcyBzcGVjaWZpZWQsIHdlIG5lZWQgdG8gY2hhbmdlIHRoZSBwcm9jZXNzIGN3ZFxuICAgIC8vIGJlY2F1c2UgYHdoaWNoYCB3aWxsIGRvIHN0YXQgY2FsbHMgYnV0IGRvZXMgbm90IHN1cHBvcnQgYSBjdXN0b20gY3dkXG4gICAgaWYgKHNob3VsZFN3aXRjaEN3ZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHJvY2Vzcy5jaGRpcihwYXJzZWQub3B0aW9ucy5jd2QpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8qIEVtcHR5ICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcmVzb2x2ZWQ7XG5cbiAgICB0cnkge1xuICAgICAgICByZXNvbHZlZCA9IHdoaWNoLnN5bmMocGFyc2VkLmNvbW1hbmQsIHtcbiAgICAgICAgICAgIHBhdGg6IGVudltnZXRQYXRoS2V5KHsgZW52IH0pXSxcbiAgICAgICAgICAgIHBhdGhFeHQ6IHdpdGhvdXRQYXRoRXh0ID8gcGF0aC5kZWxpbWl0ZXIgOiB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogRW1wdHkgKi9cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICBpZiAoc2hvdWxkU3dpdGNoQ3dkKSB7XG4gICAgICAgICAgICBwcm9jZXNzLmNoZGlyKGN3ZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzdWNjZXNzZnVsbHkgcmVzb2x2ZWQsIGVuc3VyZSB0aGF0IGFuIGFic29sdXRlIHBhdGggaXMgcmV0dXJuZWRcbiAgICAvLyBOb3RlIHRoYXQgd2hlbiBhIGN1c3RvbSBgY3dkYCB3YXMgdXNlZCwgd2UgbmVlZCB0byByZXNvbHZlIHRvIGFuIGFic29sdXRlIHBhdGggYmFzZWQgb24gaXRcbiAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSBwYXRoLnJlc29sdmUoaGFzQ3VzdG9tQ3dkID8gcGFyc2VkLm9wdGlvbnMuY3dkIDogJycsIHJlc29sdmVkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzb2x2ZWQ7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb21tYW5kKHBhcnNlZCkge1xuICAgIHJldHVybiByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkKSB8fCByZXNvbHZlQ29tbWFuZEF0dGVtcHQocGFyc2VkLCB0cnVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZXNvbHZlQ29tbWFuZDtcbiIsICIndXNlIHN0cmljdCc7XG5cbi8vIFNlZSBodHRwOi8vd3d3LnJvYnZhbmRlcndvdWRlLmNvbS9lc2NhcGVjaGFycy5waHBcbmNvbnN0IG1ldGFDaGFyc1JlZ0V4cCA9IC8oWygpXFxdWyUhXlwiYDw+Jnw7LCAqP10pL2c7XG5cbmZ1bmN0aW9uIGVzY2FwZUNvbW1hbmQoYXJnKSB7XG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIHJldHVybiBhcmc7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUFyZ3VtZW50KGFyZywgZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgLy8gQ29udmVydCB0byBzdHJpbmdcbiAgICBhcmcgPSBgJHthcmd9YDtcblxuICAgIC8vIEFsZ29yaXRobSBiZWxvdyBpcyBiYXNlZCBvbiBodHRwczovL3FudG0ub3JnL2NtZFxuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgYSBkb3VibGUgcXVvdGU6XG4gICAgLy8gZG91YmxlIHVwIGFsbCB0aGUgYmFja3NsYXNoZXMgYW5kIGVzY2FwZSB0aGUgZG91YmxlIHF1b3RlXG4gICAgYXJnID0gYXJnLnJlcGxhY2UoLyhcXFxcKilcIi9nLCAnJDEkMVxcXFxcIicpO1xuXG4gICAgLy8gU2VxdWVuY2Ugb2YgYmFja3NsYXNoZXMgZm9sbG93ZWQgYnkgdGhlIGVuZCBvZiB0aGUgc3RyaW5nXG4gICAgLy8gKHdoaWNoIHdpbGwgYmVjb21lIGEgZG91YmxlIHF1b3RlIGxhdGVyKTpcbiAgICAvLyBkb3VibGUgdXAgYWxsIHRoZSBiYWNrc2xhc2hlc1xuICAgIGFyZyA9IGFyZy5yZXBsYWNlKC8oXFxcXCopJC8sICckMSQxJyk7XG5cbiAgICAvLyBBbGwgb3RoZXIgYmFja3NsYXNoZXMgb2NjdXIgbGl0ZXJhbGx5XG5cbiAgICAvLyBRdW90ZSB0aGUgd2hvbGUgdGhpbmc6XG4gICAgYXJnID0gYFwiJHthcmd9XCJgO1xuXG4gICAgLy8gRXNjYXBlIG1ldGEgY2hhcnNcbiAgICBhcmcgPSBhcmcucmVwbGFjZShtZXRhQ2hhcnNSZWdFeHAsICdeJDEnKTtcblxuICAgIC8vIERvdWJsZSBlc2NhcGUgbWV0YSBjaGFycyBpZiBuZWNlc3NhcnlcbiAgICBpZiAoZG91YmxlRXNjYXBlTWV0YUNoYXJzKSB7XG4gICAgICAgIGFyZyA9IGFyZy5yZXBsYWNlKG1ldGFDaGFyc1JlZ0V4cCwgJ14kMScpO1xuICAgIH1cblxuICAgIHJldHVybiBhcmc7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNvbW1hbmQgPSBlc2NhcGVDb21tYW5kO1xubW9kdWxlLmV4cG9ydHMuYXJndW1lbnQgPSBlc2NhcGVBcmd1bWVudDtcbiIsICIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IC9eIyEoLiopLztcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBzaGViYW5nUmVnZXggPSByZXF1aXJlKCdzaGViYW5nLXJlZ2V4Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKHN0cmluZyA9ICcnKSA9PiB7XG5cdGNvbnN0IG1hdGNoID0gc3RyaW5nLm1hdGNoKHNoZWJhbmdSZWdleCk7XG5cblx0aWYgKCFtYXRjaCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Y29uc3QgW3BhdGgsIGFyZ3VtZW50XSA9IG1hdGNoWzBdLnJlcGxhY2UoLyMhID8vLCAnJykuc3BsaXQoJyAnKTtcblx0Y29uc3QgYmluYXJ5ID0gcGF0aC5zcGxpdCgnLycpLnBvcCgpO1xuXG5cdGlmIChiaW5hcnkgPT09ICdlbnYnKSB7XG5cdFx0cmV0dXJuIGFyZ3VtZW50O1xuXHR9XG5cblx0cmV0dXJuIGFyZ3VtZW50ID8gYCR7YmluYXJ5fSAke2FyZ3VtZW50fWAgOiBiaW5hcnk7XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qgc2hlYmFuZ0NvbW1hbmQgPSByZXF1aXJlKCdzaGViYW5nLWNvbW1hbmQnKTtcblxuZnVuY3Rpb24gcmVhZFNoZWJhbmcoY29tbWFuZCkge1xuICAgIC8vIFJlYWQgdGhlIGZpcnN0IDE1MCBieXRlcyBmcm9tIHRoZSBmaWxlXG4gICAgY29uc3Qgc2l6ZSA9IDE1MDtcbiAgICBjb25zdCBidWZmZXIgPSBCdWZmZXIuYWxsb2Moc2l6ZSk7XG5cbiAgICBsZXQgZmQ7XG5cbiAgICB0cnkge1xuICAgICAgICBmZCA9IGZzLm9wZW5TeW5jKGNvbW1hbmQsICdyJyk7XG4gICAgICAgIGZzLnJlYWRTeW5jKGZkLCBidWZmZXIsIDAsIHNpemUsIDApO1xuICAgICAgICBmcy5jbG9zZVN5bmMoZmQpO1xuICAgIH0gY2F0Y2ggKGUpIHsgLyogRW1wdHkgKi8gfVxuXG4gICAgLy8gQXR0ZW1wdCB0byBleHRyYWN0IHNoZWJhbmcgKG51bGwgaXMgcmV0dXJuZWQgaWYgbm90IGEgc2hlYmFuZylcbiAgICByZXR1cm4gc2hlYmFuZ0NvbW1hbmQoYnVmZmVyLnRvU3RyaW5nKCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlYWRTaGViYW5nO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHJlc29sdmVDb21tYW5kID0gcmVxdWlyZSgnLi91dGlsL3Jlc29sdmVDb21tYW5kJyk7XG5jb25zdCBlc2NhcGUgPSByZXF1aXJlKCcuL3V0aWwvZXNjYXBlJyk7XG5jb25zdCByZWFkU2hlYmFuZyA9IHJlcXVpcmUoJy4vdXRpbC9yZWFkU2hlYmFuZycpO1xuXG5jb25zdCBpc1dpbiA9IHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMic7XG5jb25zdCBpc0V4ZWN1dGFibGVSZWdFeHAgPSAvXFwuKD86Y29tfGV4ZSkkL2k7XG5jb25zdCBpc0NtZFNoaW1SZWdFeHAgPSAvbm9kZV9tb2R1bGVzW1xcXFwvXS5iaW5bXFxcXC9dW15cXFxcL10rXFwuY21kJC9pO1xuXG5mdW5jdGlvbiBkZXRlY3RTaGViYW5nKHBhcnNlZCkge1xuICAgIHBhcnNlZC5maWxlID0gcmVzb2x2ZUNvbW1hbmQocGFyc2VkKTtcblxuICAgIGNvbnN0IHNoZWJhbmcgPSBwYXJzZWQuZmlsZSAmJiByZWFkU2hlYmFuZyhwYXJzZWQuZmlsZSk7XG5cbiAgICBpZiAoc2hlYmFuZykge1xuICAgICAgICBwYXJzZWQuYXJncy51bnNoaWZ0KHBhcnNlZC5maWxlKTtcbiAgICAgICAgcGFyc2VkLmNvbW1hbmQgPSBzaGViYW5nO1xuXG4gICAgICAgIHJldHVybiByZXNvbHZlQ29tbWFuZChwYXJzZWQpO1xuICAgIH1cblxuICAgIHJldHVybiBwYXJzZWQuZmlsZTtcbn1cblxuZnVuY3Rpb24gcGFyc2VOb25TaGVsbChwYXJzZWQpIHtcbiAgICBpZiAoIWlzV2luKSB7XG4gICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgfVxuXG4gICAgLy8gRGV0ZWN0ICYgYWRkIHN1cHBvcnQgZm9yIHNoZWJhbmdzXG4gICAgY29uc3QgY29tbWFuZEZpbGUgPSBkZXRlY3RTaGViYW5nKHBhcnNlZCk7XG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIGEgc2hlbGwgaWYgdGhlIGNvbW1hbmQgZmlsZW5hbWUgaXMgYW4gZXhlY3V0YWJsZVxuICAgIGNvbnN0IG5lZWRzU2hlbGwgPSAhaXNFeGVjdXRhYmxlUmVnRXhwLnRlc3QoY29tbWFuZEZpbGUpO1xuXG4gICAgLy8gSWYgYSBzaGVsbCBpcyByZXF1aXJlZCwgdXNlIGNtZC5leGUgYW5kIHRha2UgY2FyZSBvZiBlc2NhcGluZyBldmVyeXRoaW5nIGNvcnJlY3RseVxuICAgIC8vIE5vdGUgdGhhdCBgZm9yY2VTaGVsbGAgaXMgYW4gaGlkZGVuIG9wdGlvbiB1c2VkIG9ubHkgaW4gdGVzdHNcbiAgICBpZiAocGFyc2VkLm9wdGlvbnMuZm9yY2VTaGVsbCB8fCBuZWVkc1NoZWxsKSB7XG4gICAgICAgIC8vIE5lZWQgdG8gZG91YmxlIGVzY2FwZSBtZXRhIGNoYXJzIGlmIHRoZSBjb21tYW5kIGlzIGEgY21kLXNoaW0gbG9jYXRlZCBpbiBgbm9kZV9tb2R1bGVzLy5iaW4vYFxuICAgICAgICAvLyBUaGUgY21kLXNoaW0gc2ltcGx5IGNhbGxzIGV4ZWN1dGUgdGhlIHBhY2thZ2UgYmluIGZpbGUgd2l0aCBOb2RlSlMsIHByb3h5aW5nIGFueSBhcmd1bWVudFxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBlc2NhcGUgb2YgbWV0YWNoYXJzIHdpdGggXiBnZXRzIGludGVycHJldGVkIHdoZW4gdGhlIGNtZC5leGUgaXMgZmlyc3QgY2FsbGVkLFxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGRvdWJsZSBlc2NhcGUgdGhlbVxuICAgICAgICBjb25zdCBuZWVkc0RvdWJsZUVzY2FwZU1ldGFDaGFycyA9IGlzQ21kU2hpbVJlZ0V4cC50ZXN0KGNvbW1hbmRGaWxlKTtcblxuICAgICAgICAvLyBOb3JtYWxpemUgcG9zaXggcGF0aHMgaW50byBPUyBjb21wYXRpYmxlIHBhdGhzIChlLmcuOiBmb28vYmFyIC0+IGZvb1xcYmFyKVxuICAgICAgICAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBvdGhlcndpc2UgaXQgd2lsbCBhbHdheXMgZmFpbCB3aXRoIEVOT0VOVCBpbiB0aG9zZSBjYXNlc1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKHBhcnNlZC5jb21tYW5kKTtcblxuICAgICAgICAvLyBFc2NhcGUgY29tbWFuZCAmIGFyZ3VtZW50c1xuICAgICAgICBwYXJzZWQuY29tbWFuZCA9IGVzY2FwZS5jb21tYW5kKHBhcnNlZC5jb21tYW5kKTtcbiAgICAgICAgcGFyc2VkLmFyZ3MgPSBwYXJzZWQuYXJncy5tYXAoKGFyZykgPT4gZXNjYXBlLmFyZ3VtZW50KGFyZywgbmVlZHNEb3VibGVFc2NhcGVNZXRhQ2hhcnMpKTtcblxuICAgICAgICBjb25zdCBzaGVsbENvbW1hbmQgPSBbcGFyc2VkLmNvbW1hbmRdLmNvbmNhdChwYXJzZWQuYXJncykuam9pbignICcpO1xuXG4gICAgICAgIHBhcnNlZC5hcmdzID0gWycvZCcsICcvcycsICcvYycsIGBcIiR7c2hlbGxDb21tYW5kfVwiYF07XG4gICAgICAgIHBhcnNlZC5jb21tYW5kID0gcHJvY2Vzcy5lbnYuY29tc3BlYyB8fCAnY21kLmV4ZSc7XG4gICAgICAgIHBhcnNlZC5vcHRpb25zLndpbmRvd3NWZXJiYXRpbUFyZ3VtZW50cyA9IHRydWU7IC8vIFRlbGwgbm9kZSdzIHNwYXduIHRoYXQgdGhlIGFyZ3VtZW50cyBhcmUgYWxyZWFkeSBlc2NhcGVkXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnNlZDtcbn1cblxuZnVuY3Rpb24gcGFyc2UoY29tbWFuZCwgYXJncywgb3B0aW9ucykge1xuICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHMsIHNpbWlsYXIgdG8gbm9kZWpzXG4gICAgaWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZ3M7XG4gICAgICAgIGFyZ3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFyZ3MgPSBhcmdzID8gYXJncy5zbGljZSgwKSA6IFtdOyAvLyBDbG9uZSBhcnJheSB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcbiAgICBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7IC8vIENsb25lIG9iamVjdCB0byBhdm9pZCBjaGFuZ2luZyB0aGUgb3JpZ2luYWxcblxuICAgIC8vIEJ1aWxkIG91ciBwYXJzZWQgb2JqZWN0XG4gICAgY29uc3QgcGFyc2VkID0ge1xuICAgICAgICBjb21tYW5kLFxuICAgICAgICBhcmdzLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICBjb21tYW5kLFxuICAgICAgICAgICAgYXJncyxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gRGVsZWdhdGUgZnVydGhlciBwYXJzaW5nIHRvIHNoZWxsIG9yIG5vbi1zaGVsbFxuICAgIHJldHVybiBvcHRpb25zLnNoZWxsID8gcGFyc2VkIDogcGFyc2VOb25TaGVsbChwYXJzZWQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlO1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5mdW5jdGlvbiBub3RGb3VuZEVycm9yKG9yaWdpbmFsLCBzeXNjYWxsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGAke3N5c2NhbGx9ICR7b3JpZ2luYWwuY29tbWFuZH0gRU5PRU5UYCksIHtcbiAgICAgICAgY29kZTogJ0VOT0VOVCcsXG4gICAgICAgIGVycm5vOiAnRU5PRU5UJyxcbiAgICAgICAgc3lzY2FsbDogYCR7c3lzY2FsbH0gJHtvcmlnaW5hbC5jb21tYW5kfWAsXG4gICAgICAgIHBhdGg6IG9yaWdpbmFsLmNvbW1hbmQsXG4gICAgICAgIHNwYXduYXJnczogb3JpZ2luYWwuYXJncyxcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaG9va0NoaWxkUHJvY2VzcyhjcCwgcGFyc2VkKSB7XG4gICAgaWYgKCFpc1dpbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ2luYWxFbWl0ID0gY3AuZW1pdDtcblxuICAgIGNwLmVtaXQgPSBmdW5jdGlvbiAobmFtZSwgYXJnMSkge1xuICAgICAgICAvLyBJZiBlbWl0dGluZyBcImV4aXRcIiBldmVudCBhbmQgZXhpdCBjb2RlIGlzIDEsIHdlIG5lZWQgdG8gY2hlY2sgaWZcbiAgICAgICAgLy8gdGhlIGNvbW1hbmQgZXhpc3RzIGFuZCBlbWl0IGFuIFwiZXJyb3JcIiBpbnN0ZWFkXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vSW5kaWdvVW5pdGVkL25vZGUtY3Jvc3Mtc3Bhd24vaXNzdWVzLzE2XG4gICAgICAgIGlmIChuYW1lID09PSAnZXhpdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IHZlcmlmeUVOT0VOVChhcmcxLCBwYXJzZWQsICdzcGF3bicpO1xuXG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5jYWxsKGNwLCAnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsRW1pdC5hcHBseShjcCwgYXJndW1lbnRzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICB9O1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlQoc3RhdHVzLCBwYXJzZWQpIHtcbiAgICBpZiAoaXNXaW4gJiYgc3RhdHVzID09PSAxICYmICFwYXJzZWQuZmlsZSkge1xuICAgICAgICByZXR1cm4gbm90Rm91bmRFcnJvcihwYXJzZWQub3JpZ2luYWwsICdzcGF3bicpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiB2ZXJpZnlFTk9FTlRTeW5jKHN0YXR1cywgcGFyc2VkKSB7XG4gICAgaWYgKGlzV2luICYmIHN0YXR1cyA9PT0gMSAmJiAhcGFyc2VkLmZpbGUpIHtcbiAgICAgICAgcmV0dXJuIG5vdEZvdW5kRXJyb3IocGFyc2VkLm9yaWdpbmFsLCAnc3Bhd25TeW5jJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGhvb2tDaGlsZFByb2Nlc3MsXG4gICAgdmVyaWZ5RU5PRU5ULFxuICAgIHZlcmlmeUVOT0VOVFN5bmMsXG4gICAgbm90Rm91bmRFcnJvcixcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBjcCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IHBhcnNlID0gcmVxdWlyZSgnLi9saWIvcGFyc2UnKTtcbmNvbnN0IGVub2VudCA9IHJlcXVpcmUoJy4vbGliL2Vub2VudCcpO1xuXG5mdW5jdGlvbiBzcGF3bihjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCBzcGF3bmVkID0gY3Auc3Bhd24ocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBIb29rIGludG8gY2hpbGQgcHJvY2VzcyBcImV4aXRcIiBldmVudCB0byBlbWl0IGFuIGVycm9yIGlmIHRoZSBjb21tYW5kXG4gICAgLy8gZG9lcyBub3QgZXhpc3RzLCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICBlbm9lbnQuaG9va0NoaWxkUHJvY2VzcyhzcGF3bmVkLCBwYXJzZWQpO1xuXG4gICAgcmV0dXJuIHNwYXduZWQ7XG59XG5cbmZ1bmN0aW9uIHNwYXduU3luYyhjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUGFyc2UgdGhlIGFyZ3VtZW50c1xuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlKGNvbW1hbmQsIGFyZ3MsIG9wdGlvbnMpO1xuXG4gICAgLy8gU3Bhd24gdGhlIGNoaWxkIHByb2Nlc3NcbiAgICBjb25zdCByZXN1bHQgPSBjcC5zcGF3blN5bmMocGFyc2VkLmNvbW1hbmQsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cbiAgICAvLyBBbmFseXplIGlmIHRoZSBjb21tYW5kIGRvZXMgbm90IGV4aXN0LCBzZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9JbmRpZ29Vbml0ZWQvbm9kZS1jcm9zcy1zcGF3bi9pc3N1ZXMvMTZcbiAgICByZXN1bHQuZXJyb3IgPSByZXN1bHQuZXJyb3IgfHwgZW5vZW50LnZlcmlmeUVOT0VOVFN5bmMocmVzdWx0LnN0YXR1cywgcGFyc2VkKTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3Bhd247XG5tb2R1bGUuZXhwb3J0cy5zcGF3biA9IHNwYXduO1xubW9kdWxlLmV4cG9ydHMuc3luYyA9IHNwYXduU3luYztcblxubW9kdWxlLmV4cG9ydHMuX3BhcnNlID0gcGFyc2U7XG5tb2R1bGUuZXhwb3J0cy5fZW5vZW50ID0gZW5vZW50O1xuIiwgIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dCA9PiB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBpbnB1dC5sZW5ndGggLSAxKTtcblx0fVxuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGlucHV0Lmxlbmd0aCAtIDEpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufTtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuY29uc3QgcGF0aEtleSA9IHJlcXVpcmUoJ3BhdGgta2V5Jyk7XG5cbmNvbnN0IG5wbVJ1blBhdGggPSBvcHRpb25zID0+IHtcblx0b3B0aW9ucyA9IHtcblx0XHRjd2Q6IHByb2Nlc3MuY3dkKCksXG5cdFx0cGF0aDogcHJvY2Vzcy5lbnZbcGF0aEtleSgpXSxcblx0XHRleGVjUGF0aDogcHJvY2Vzcy5leGVjUGF0aCxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0bGV0IHByZXZpb3VzO1xuXHRsZXQgY3dkUGF0aCA9IHBhdGgucmVzb2x2ZShvcHRpb25zLmN3ZCk7XG5cdGNvbnN0IHJlc3VsdCA9IFtdO1xuXG5cdHdoaWxlIChwcmV2aW91cyAhPT0gY3dkUGF0aCkge1xuXHRcdHJlc3VsdC5wdXNoKHBhdGguam9pbihjd2RQYXRoLCAnbm9kZV9tb2R1bGVzLy5iaW4nKSk7XG5cdFx0cHJldmlvdXMgPSBjd2RQYXRoO1xuXHRcdGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkUGF0aCwgJy4uJyk7XG5cdH1cblxuXHQvLyBFbnN1cmUgdGhlIHJ1bm5pbmcgYG5vZGVgIGJpbmFyeSBpcyB1c2VkXG5cdGNvbnN0IGV4ZWNQYXRoRGlyID0gcGF0aC5yZXNvbHZlKG9wdGlvbnMuY3dkLCBvcHRpb25zLmV4ZWNQYXRoLCAnLi4nKTtcblx0cmVzdWx0LnB1c2goZXhlY1BhdGhEaXIpO1xuXG5cdHJldHVybiByZXN1bHQuY29uY2F0KG9wdGlvbnMucGF0aCkuam9pbihwYXRoLmRlbGltaXRlcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5wbVJ1blBhdGg7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG5wbVJ1blBhdGg7XG5cbm1vZHVsZS5leHBvcnRzLmVudiA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0ge1xuXHRcdGVudjogcHJvY2Vzcy5lbnYsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGNvbnN0IGVudiA9IHsuLi5vcHRpb25zLmVudn07XG5cdGNvbnN0IHBhdGggPSBwYXRoS2V5KHtlbnZ9KTtcblxuXHRvcHRpb25zLnBhdGggPSBlbnZbcGF0aF07XG5cdGVudltwYXRoXSA9IG1vZHVsZS5leHBvcnRzKG9wdGlvbnMpO1xuXG5cdHJldHVybiBlbnY7XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbWltaWNGbiA9ICh0bywgZnJvbSkgPT4ge1xuXHRmb3IgKGNvbnN0IHByb3Agb2YgUmVmbGVjdC5vd25LZXlzKGZyb20pKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCBwcm9wLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3ApKTtcblx0fVxuXG5cdHJldHVybiB0bztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWltaWNGbjtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbWltaWNGbjtcbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBtaW1pY0ZuID0gcmVxdWlyZSgnbWltaWMtZm4nKTtcblxuY29uc3QgY2FsbGVkRnVuY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3Qgb25ldGltZSA9IChmdW5jdGlvbl8sIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAodHlwZW9mIGZ1bmN0aW9uXyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGxldCByZXR1cm5WYWx1ZTtcblx0bGV0IGNhbGxDb3VudCA9IDA7XG5cdGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uXy5kaXNwbGF5TmFtZSB8fCBmdW5jdGlvbl8ubmFtZSB8fCAnPGFub255bW91cz4nO1xuXG5cdGNvbnN0IG9uZXRpbWUgPSBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgKytjYWxsQ291bnQpO1xuXG5cdFx0aWYgKGNhbGxDb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuVmFsdWUgPSBmdW5jdGlvbl8uYXBwbHkodGhpcywgYXJndW1lbnRzXyk7XG5cdFx0XHRmdW5jdGlvbl8gPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAob3B0aW9ucy50aHJvdyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGdW5jdGlvbiBcXGAke2Z1bmN0aW9uTmFtZX1cXGAgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2VgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG5cblx0bWltaWNGbihvbmV0aW1lLCBmdW5jdGlvbl8pO1xuXHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsIGNhbGxDb3VudCk7XG5cblx0cmV0dXJuIG9uZXRpbWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9uZXRpbWU7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG9uZXRpbWU7XG5cbm1vZHVsZS5leHBvcnRzLmNhbGxDb3VudCA9IGZ1bmN0aW9uXyA9PiB7XG5cdGlmICghY2FsbGVkRnVuY3Rpb25zLmhhcyhmdW5jdGlvbl8pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gZnVuY3Rpb24gXFxgJHtmdW5jdGlvbl8ubmFtZX1cXGAgaXMgbm90IHdyYXBwZWQgYnkgdGhlIFxcYG9uZXRpbWVcXGAgcGFja2FnZWApO1xuXHR9XG5cblx0cmV0dXJuIGNhbGxlZEZ1bmN0aW9ucy5nZXQoZnVuY3Rpb25fKTtcbn07XG4iLCAiLyogZXNsaW50LWRpc2FibGUgbWF4LWxpbmVzICovXG4vLyBMaXN0IG9mIGtub3duIHByb2Nlc3Mgc2lnbmFscyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZW1cbmV4cG9ydCBjb25zdCBTSUdOQUxTID0gW1xuICB7XG4gICAgbmFtZTogJ1NJR0hVUCcsXG4gICAgbnVtYmVyOiAxLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdUZXJtaW5hbCBjbG9zZWQnLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR0lOVCcsXG4gICAgbnVtYmVyOiAyLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQycsXG4gICAgc3RhbmRhcmQ6ICdhbnNpJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdRVUlUJyxcbiAgICBudW1iZXI6IDMsXG4gICAgYWN0aW9uOiAnY29yZScsXG4gICAgZGVzY3JpcHRpb246ICdVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtXFxcXCcsXG4gICAgc3RhbmRhcmQ6ICdwb3NpeCcsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHSUxMJyxcbiAgICBudW1iZXI6IDQsXG4gICAgYWN0aW9uOiAnY29yZScsXG4gICAgZGVzY3JpcHRpb246ICdJbnZhbGlkIG1hY2hpbmUgaW5zdHJ1Y3Rpb24nLFxuICAgIHN0YW5kYXJkOiAnYW5zaScsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVFJBUCcsXG4gICAgbnVtYmVyOiA1LFxuICAgIGFjdGlvbjogJ2NvcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnRGVidWdnZXIgYnJlYWtwb2ludCcsXG4gICAgc3RhbmRhcmQ6ICdwb3NpeCcsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHQUJSVCcsXG4gICAgbnVtYmVyOiA2LFxuICAgIGFjdGlvbjogJ2NvcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQWJvcnRlZCcsXG4gICAgc3RhbmRhcmQ6ICdhbnNpJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdJT1QnLFxuICAgIG51bWJlcjogNixcbiAgICBhY3Rpb246ICdjb3JlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Fib3J0ZWQnLFxuICAgIHN0YW5kYXJkOiAnYnNkJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdCVVMnLFxuICAgIG51bWJlcjogNyxcbiAgICBhY3Rpb246ICdjb3JlJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdCdXMgZXJyb3IgZHVlIHRvIG1pc2FsaWduZWQsIG5vbi1leGlzdGluZyBhZGRyZXNzIG9yIHBhZ2luZyBlcnJvcicsXG4gICAgc3RhbmRhcmQ6ICdic2QnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR0VNVCcsXG4gICAgbnVtYmVyOiA3LFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdDb21tYW5kIHNob3VsZCBiZSBlbXVsYXRlZCBidXQgaXMgbm90IGltcGxlbWVudGVkJyxcbiAgICBzdGFuZGFyZDogJ290aGVyJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdGUEUnLFxuICAgIG51bWJlcjogOCxcbiAgICBhY3Rpb246ICdjb3JlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0Zsb2F0aW5nIHBvaW50IGFyaXRobWV0aWMgZXJyb3InLFxuICAgIHN0YW5kYXJkOiAnYW5zaScsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHS0lMTCcsXG4gICAgbnVtYmVyOiA5LFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdGb3JjZWQgdGVybWluYXRpb24nLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICAgIGZvcmNlZDogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdVU1IxJyxcbiAgICBudW1iZXI6IDEwLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWwnLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1NFR1YnLFxuICAgIG51bWJlcjogMTEsXG4gICAgYWN0aW9uOiAnY29yZScsXG4gICAgZGVzY3JpcHRpb246ICdTZWdtZW50YXRpb24gZmF1bHQnLFxuICAgIHN0YW5kYXJkOiAnYW5zaScsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVVNSMicsXG4gICAgbnVtYmVyOiAxMixcbiAgICBhY3Rpb246ICd0ZXJtaW5hdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsJyxcbiAgICBzdGFuZGFyZDogJ3Bvc2l4JyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdQSVBFJyxcbiAgICBudW1iZXI6IDEzLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdCcm9rZW4gcGlwZSBvciBzb2NrZXQnLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR0FMUk0nLFxuICAgIG51bWJlcjogMTQsXG4gICAgYWN0aW9uOiAndGVybWluYXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1RpbWVvdXQgb3IgdGltZXInLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1RFUk0nLFxuICAgIG51bWJlcjogMTUsXG4gICAgYWN0aW9uOiAndGVybWluYXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Rlcm1pbmF0aW9uJyxcbiAgICBzdGFuZGFyZDogJ2Fuc2knLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1NUS0ZMVCcsXG4gICAgbnVtYmVyOiAxNixcbiAgICBhY3Rpb246ICd0ZXJtaW5hdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RhY2sgaXMgZW1wdHkgb3Igb3ZlcmZsb3dlZCcsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHQ0hMRCcsXG4gICAgbnVtYmVyOiAxNyxcbiAgICBhY3Rpb246ICdpZ25vcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWQnLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR0NMRCcsXG4gICAgbnVtYmVyOiAxNyxcbiAgICBhY3Rpb246ICdpZ25vcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWQnLFxuICAgIHN0YW5kYXJkOiAnb3RoZXInLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR0NPTlQnLFxuICAgIG51bWJlcjogMTgsXG4gICAgYWN0aW9uOiAndW5wYXVzZScsXG4gICAgZGVzY3JpcHRpb246ICdVbnBhdXNlZCcsXG4gICAgc3RhbmRhcmQ6ICdwb3NpeCcsXG4gICAgZm9yY2VkOiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1NUT1AnLFxuICAgIG51bWJlcjogMTksXG4gICAgYWN0aW9uOiAncGF1c2UnLFxuICAgIGRlc2NyaXB0aW9uOiAnUGF1c2VkJyxcbiAgICBzdGFuZGFyZDogJ3Bvc2l4JyxcbiAgICBmb3JjZWQ6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVFNUUCcsXG4gICAgbnVtYmVyOiAyMCxcbiAgICBhY3Rpb246ICdwYXVzZScsXG4gICAgZGVzY3JpcHRpb246ICdQYXVzZWQgdXNpbmcgQ1RSTC1aIG9yIFwic3VzcGVuZFwiJyxcbiAgICBzdGFuZGFyZDogJ3Bvc2l4JyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdUVElOJyxcbiAgICBudW1iZXI6IDIxLFxuICAgIGFjdGlvbjogJ3BhdXNlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0JhY2tncm91bmQgcHJvY2VzcyBjYW5ub3QgcmVhZCB0ZXJtaW5hbCBpbnB1dCcsXG4gICAgc3RhbmRhcmQ6ICdwb3NpeCcsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHQlJFQUsnLFxuICAgIG51bWJlcjogMjEsXG4gICAgYWN0aW9uOiAndGVybWluYXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1VzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1CUkVBSycsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVFRPVScsXG4gICAgbnVtYmVyOiAyMixcbiAgICBhY3Rpb246ICdwYXVzZScsXG4gICAgZGVzY3JpcHRpb246ICdCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHdyaXRlIHRvIHRlcm1pbmFsIG91dHB1dCcsXG4gICAgc3RhbmRhcmQ6ICdwb3NpeCcsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVVJHJyxcbiAgICBudW1iZXI6IDIzLFxuICAgIGFjdGlvbjogJ2lnbm9yZScsXG4gICAgZGVzY3JpcHRpb246ICdTb2NrZXQgcmVjZWl2ZWQgb3V0LW9mLWJhbmQgZGF0YScsXG4gICAgc3RhbmRhcmQ6ICdic2QnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1hDUFUnLFxuICAgIG51bWJlcjogMjQsXG4gICAgYWN0aW9uOiAnY29yZScsXG4gICAgZGVzY3JpcHRpb246ICdQcm9jZXNzIHRpbWVkIG91dCcsXG4gICAgc3RhbmRhcmQ6ICdic2QnLFxuICB9LFxuICB7XG4gICAgbmFtZTogJ1NJR1hGU1onLFxuICAgIG51bWJlcjogMjUsXG4gICAgYWN0aW9uOiAnY29yZScsXG4gICAgZGVzY3JpcHRpb246ICdGaWxlIHRvbyBiaWcnLFxuICAgIHN0YW5kYXJkOiAnYnNkJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdWVEFMUk0nLFxuICAgIG51bWJlcjogMjYsXG4gICAgYWN0aW9uOiAndGVybWluYXRlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1RpbWVvdXQgb3IgdGltZXInLFxuICAgIHN0YW5kYXJkOiAnYnNkJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdQUk9GJyxcbiAgICBudW1iZXI6IDI3LFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdUaW1lb3V0IG9yIHRpbWVyJyxcbiAgICBzdGFuZGFyZDogJ2JzZCcsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHV0lOQ0gnLFxuICAgIG51bWJlcjogMjgsXG4gICAgYWN0aW9uOiAnaWdub3JlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Rlcm1pbmFsIHdpbmRvdyBzaXplIGNoYW5nZWQnLFxuICAgIHN0YW5kYXJkOiAnYnNkJyxcbiAgfSxcbiAge1xuICAgIG5hbWU6ICdTSUdJTycsXG4gICAgbnVtYmVyOiAyOSxcbiAgICBhY3Rpb246ICd0ZXJtaW5hdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnSS9PIGlzIGF2YWlsYWJsZScsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHUE9MTCcsXG4gICAgbnVtYmVyOiAyOSxcbiAgICBhY3Rpb246ICd0ZXJtaW5hdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2F0Y2hlZCBldmVudCcsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHSU5GTycsXG4gICAgbnVtYmVyOiAyOSxcbiAgICBhY3Rpb246ICdpZ25vcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnUmVxdWVzdCBmb3IgcHJvY2VzcyBpbmZvcm1hdGlvbicsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHUFdSJyxcbiAgICBudW1iZXI6IDMwLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdEZXZpY2UgcnVubmluZyBvdXQgb2YgcG93ZXInLFxuICAgIHN0YW5kYXJkOiAnc3lzdGVtdicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHU1lTJyxcbiAgICBudW1iZXI6IDMxLFxuICAgIGFjdGlvbjogJ2NvcmUnLFxuICAgIGRlc2NyaXB0aW9uOiAnSW52YWxpZCBzeXN0ZW0gY2FsbCcsXG4gICAgc3RhbmRhcmQ6ICdvdGhlcicsXG4gIH0sXG4gIHtcbiAgICBuYW1lOiAnU0lHVU5VU0VEJyxcbiAgICBudW1iZXI6IDMxLFxuICAgIGFjdGlvbjogJ3Rlcm1pbmF0ZScsXG4gICAgZGVzY3JpcHRpb246ICdJbnZhbGlkIHN5c3RlbSBjYWxsJyxcbiAgICBzdGFuZGFyZDogJ290aGVyJyxcbiAgfSxcbl1cbi8qIGVzbGludC1lbmFibGUgbWF4LWxpbmVzICovXG4iLCAiLy8gTGlzdCBvZiByZWFsdGltZSBzaWduYWxzIHdpdGggaW5mb3JtYXRpb24gYWJvdXQgdGhlbVxuZXhwb3J0IGNvbnN0IGdldFJlYWx0aW1lU2lnbmFscyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBsZW5ndGggPSBTSUdSVE1BWCAtIFNJR1JUTUlOICsgMVxuICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aCB9LCBnZXRSZWFsdGltZVNpZ25hbClcbn1cblxuY29uc3QgZ2V0UmVhbHRpbWVTaWduYWwgPSBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBgU0lHUlQke2luZGV4ICsgMX1gLFxuICAgIG51bWJlcjogU0lHUlRNSU4gKyBpbmRleCxcbiAgICBhY3Rpb246ICd0ZXJtaW5hdGUnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsIChyZWFsdGltZSknLFxuICAgIHN0YW5kYXJkOiAncG9zaXgnLFxuICB9XG59XG5cbmNvbnN0IFNJR1JUTUlOID0gMzRcbmV4cG9ydCBjb25zdCBTSUdSVE1BWCA9IDY0XG4iLCAiaW1wb3J0IHsgY29uc3RhbnRzIH0gZnJvbSAnb3MnXG5cbmltcG9ydCB7IFNJR05BTFMgfSBmcm9tICcuL2NvcmUuanMnXG5pbXBvcnQgeyBnZXRSZWFsdGltZVNpZ25hbHMgfSBmcm9tICcuL3JlYWx0aW1lLmpzJ1xuXG4vLyBSZXRyaWV2ZSBsaXN0IG9mIGtub3cgc2lnbmFscyAoaW5jbHVkaW5nIHJlYWx0aW1lKSB3aXRoIGluZm9ybWF0aW9uIGFib3V0XG4vLyB0aGVtXG5leHBvcnQgY29uc3QgZ2V0U2lnbmFscyA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCByZWFsdGltZVNpZ25hbHMgPSBnZXRSZWFsdGltZVNpZ25hbHMoKVxuICBjb25zdCBzaWduYWxzID0gWy4uLlNJR05BTFMsIC4uLnJlYWx0aW1lU2lnbmFsc10ubWFwKG5vcm1hbGl6ZVNpZ25hbClcbiAgcmV0dXJuIHNpZ25hbHNcbn1cblxuLy8gTm9ybWFsaXplIHNpZ25hbDpcbi8vICAtIGBudW1iZXJgOiBzaWduYWwgbnVtYmVycyBhcmUgT1Mtc3BlY2lmaWMuIFRoaXMgaXMgdGFrZW4gaW50byBhY2NvdW50IGJ5XG4vLyAgICBgb3MuY29uc3RhbnRzLnNpZ25hbHNgLiBIb3dldmVyIHdlIHByb3ZpZGUgYSBkZWZhdWx0IGBudW1iZXJgIHNpbmNlIHNvbWVcbi8vICAgICBzaWduYWxzIGFyZSBub3QgZGVmaW5lZCBmb3Igc29tZSBPUy5cbi8vICAtIGBmb3JjZWRgOiBzZXQgZGVmYXVsdCB0byBgZmFsc2VgXG4vLyAgLSBgc3VwcG9ydGVkYDogc2V0IHZhbHVlXG5jb25zdCBub3JtYWxpemVTaWduYWwgPSBmdW5jdGlvbih7XG4gIG5hbWUsXG4gIG51bWJlcjogZGVmYXVsdE51bWJlcixcbiAgZGVzY3JpcHRpb24sXG4gIGFjdGlvbixcbiAgZm9yY2VkID0gZmFsc2UsXG4gIHN0YW5kYXJkLFxufSkge1xuICBjb25zdCB7XG4gICAgc2lnbmFsczogeyBbbmFtZV06IGNvbnN0YW50U2lnbmFsIH0sXG4gIH0gPSBjb25zdGFudHNcbiAgY29uc3Qgc3VwcG9ydGVkID0gY29uc3RhbnRTaWduYWwgIT09IHVuZGVmaW5lZFxuICBjb25zdCBudW1iZXIgPSBzdXBwb3J0ZWQgPyBjb25zdGFudFNpZ25hbCA6IGRlZmF1bHROdW1iZXJcbiAgcmV0dXJuIHsgbmFtZSwgbnVtYmVyLCBkZXNjcmlwdGlvbiwgc3VwcG9ydGVkLCBhY3Rpb24sIGZvcmNlZCwgc3RhbmRhcmQgfVxufVxuIiwgImltcG9ydCB7IGNvbnN0YW50cyB9IGZyb20gJ29zJ1xuXG5pbXBvcnQgeyBnZXRTaWduYWxzIH0gZnJvbSAnLi9zaWduYWxzLmpzJ1xuaW1wb3J0IHsgU0lHUlRNQVggfSBmcm9tICcuL3JlYWx0aW1lLmpzJ1xuXG4vLyBSZXRyaWV2ZSBgc2lnbmFsc0J5TmFtZWAsIGFuIG9iamVjdCBtYXBwaW5nIHNpZ25hbCBuYW1lIHRvIHNpZ25hbCBwcm9wZXJ0aWVzLlxuLy8gV2UgbWFrZSBzdXJlIHRoZSBvYmplY3QgaXMgc29ydGVkIGJ5IGBudW1iZXJgLlxuY29uc3QgZ2V0U2lnbmFsc0J5TmFtZSA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBzaWduYWxzID0gZ2V0U2lnbmFscygpXG4gIHJldHVybiBzaWduYWxzLnJlZHVjZShnZXRTaWduYWxCeU5hbWUsIHt9KVxufVxuXG5jb25zdCBnZXRTaWduYWxCeU5hbWUgPSBmdW5jdGlvbihcbiAgc2lnbmFsQnlOYW1lTWVtbyxcbiAgeyBuYW1lLCBudW1iZXIsIGRlc2NyaXB0aW9uLCBzdXBwb3J0ZWQsIGFjdGlvbiwgZm9yY2VkLCBzdGFuZGFyZCB9LFxuKSB7XG4gIHJldHVybiB7XG4gICAgLi4uc2lnbmFsQnlOYW1lTWVtbyxcbiAgICBbbmFtZV06IHsgbmFtZSwgbnVtYmVyLCBkZXNjcmlwdGlvbiwgc3VwcG9ydGVkLCBhY3Rpb24sIGZvcmNlZCwgc3RhbmRhcmQgfSxcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TmFtZSA9IGdldFNpZ25hbHNCeU5hbWUoKVxuXG4vLyBSZXRyaWV2ZSBgc2lnbmFsc0J5TnVtYmVyYCwgYW4gb2JqZWN0IG1hcHBpbmcgc2lnbmFsIG51bWJlciB0byBzaWduYWxcbi8vIHByb3BlcnRpZXMuXG4vLyBXZSBtYWtlIHN1cmUgdGhlIG9iamVjdCBpcyBzb3J0ZWQgYnkgYG51bWJlcmAuXG5jb25zdCBnZXRTaWduYWxzQnlOdW1iZXIgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qgc2lnbmFscyA9IGdldFNpZ25hbHMoKVxuICBjb25zdCBsZW5ndGggPSBTSUdSVE1BWCArIDFcbiAgY29uc3Qgc2lnbmFsc0EgPSBBcnJheS5mcm9tKHsgbGVuZ3RoIH0sICh2YWx1ZSwgbnVtYmVyKSA9PlxuICAgIGdldFNpZ25hbEJ5TnVtYmVyKG51bWJlciwgc2lnbmFscyksXG4gIClcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIC4uLnNpZ25hbHNBKVxufVxuXG5jb25zdCBnZXRTaWduYWxCeU51bWJlciA9IGZ1bmN0aW9uKG51bWJlciwgc2lnbmFscykge1xuICBjb25zdCBzaWduYWwgPSBmaW5kU2lnbmFsQnlOdW1iZXIobnVtYmVyLCBzaWduYWxzKVxuXG4gIGlmIChzaWduYWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB7fVxuICB9XG5cbiAgY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgc3VwcG9ydGVkLCBhY3Rpb24sIGZvcmNlZCwgc3RhbmRhcmQgfSA9IHNpZ25hbFxuICByZXR1cm4ge1xuICAgIFtudW1iZXJdOiB7XG4gICAgICBuYW1lLFxuICAgICAgbnVtYmVyLFxuICAgICAgZGVzY3JpcHRpb24sXG4gICAgICBzdXBwb3J0ZWQsXG4gICAgICBhY3Rpb24sXG4gICAgICBmb3JjZWQsXG4gICAgICBzdGFuZGFyZCxcbiAgICB9LFxuICB9XG59XG5cbi8vIFNldmVyYWwgc2lnbmFscyBtaWdodCBlbmQgdXAgc2hhcmluZyB0aGUgc2FtZSBudW1iZXIgYmVjYXVzZSBvZiBPUy1zcGVjaWZpY1xuLy8gbnVtYmVycywgaW4gd2hpY2ggY2FzZSB0aG9zZSBwcmV2YWlsLlxuY29uc3QgZmluZFNpZ25hbEJ5TnVtYmVyID0gZnVuY3Rpb24obnVtYmVyLCBzaWduYWxzKSB7XG4gIGNvbnN0IHNpZ25hbCA9IHNpZ25hbHMuZmluZCgoeyBuYW1lIH0pID0+IGNvbnN0YW50cy5zaWduYWxzW25hbWVdID09PSBudW1iZXIpXG5cbiAgaWYgKHNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHNpZ25hbFxuICB9XG5cbiAgcmV0dXJuIHNpZ25hbHMuZmluZChzaWduYWxBID0+IHNpZ25hbEEubnVtYmVyID09PSBudW1iZXIpXG59XG5cbmV4cG9ydCBjb25zdCBzaWduYWxzQnlOdW1iZXIgPSBnZXRTaWduYWxzQnlOdW1iZXIoKVxuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHtzaWduYWxzQnlOYW1lfSA9IHJlcXVpcmUoJ2h1bWFuLXNpZ25hbHMnKTtcblxuY29uc3QgZ2V0RXJyb3JQcmVmaXggPSAoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSkgPT4ge1xuXHRpZiAodGltZWRPdXQpIHtcblx0XHRyZXR1cm4gYHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXR9IG1pbGxpc2Vjb25kc2A7XG5cdH1cblxuXHRpZiAoaXNDYW5jZWxlZCkge1xuXHRcdHJldHVybiAnd2FzIGNhbmNlbGVkJztcblx0fVxuXG5cdGlmIChlcnJvckNvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggJHtlcnJvckNvZGV9YDtcblx0fVxuXG5cdGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgd2FzIGtpbGxlZCB3aXRoICR7c2lnbmFsfSAoJHtzaWduYWxEZXNjcmlwdGlvbn0pYDtcblx0fVxuXG5cdGlmIChleGl0Q29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCBleGl0IGNvZGUgJHtleGl0Q29kZX1gO1xuXHR9XG5cblx0cmV0dXJuICdmYWlsZWQnO1xufTtcblxuY29uc3QgbWFrZUVycm9yID0gKHtcblx0c3Rkb3V0LFxuXHRzdGRlcnIsXG5cdGFsbCxcblx0ZXJyb3IsXG5cdHNpZ25hbCxcblx0ZXhpdENvZGUsXG5cdGNvbW1hbmQsXG5cdGVzY2FwZWRDb21tYW5kLFxuXHR0aW1lZE91dCxcblx0aXNDYW5jZWxlZCxcblx0a2lsbGVkLFxuXHRwYXJzZWQ6IHtvcHRpb25zOiB7dGltZW91dH19XG59KSA9PiB7XG5cdC8vIGBzaWduYWxgIGFuZCBgZXhpdENvZGVgIGVtaXR0ZWQgb24gYHNwYXduZWQub24oJ2V4aXQnKWAgZXZlbnQgY2FuIGJlIGBudWxsYC5cblx0Ly8gV2Ugbm9ybWFsaXplIHRoZW0gdG8gYHVuZGVmaW5lZGBcblx0ZXhpdENvZGUgPSBleGl0Q29kZSA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4aXRDb2RlO1xuXHRzaWduYWwgPSBzaWduYWwgPT09IG51bGwgPyB1bmRlZmluZWQgOiBzaWduYWw7XG5cdGNvbnN0IHNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBzaWduYWxzQnlOYW1lW3NpZ25hbF0uZGVzY3JpcHRpb247XG5cblx0Y29uc3QgZXJyb3JDb2RlID0gZXJyb3IgJiYgZXJyb3IuY29kZTtcblxuXHRjb25zdCBwcmVmaXggPSBnZXRFcnJvclByZWZpeCh7dGltZWRPdXQsIHRpbWVvdXQsIGVycm9yQ29kZSwgc2lnbmFsLCBzaWduYWxEZXNjcmlwdGlvbiwgZXhpdENvZGUsIGlzQ2FuY2VsZWR9KTtcblx0Y29uc3QgZXhlY2FNZXNzYWdlID0gYENvbW1hbmQgJHtwcmVmaXh9OiAke2NvbW1hbmR9YDtcblx0Y29uc3QgaXNFcnJvciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlcnJvcikgPT09ICdbb2JqZWN0IEVycm9yXSc7XG5cdGNvbnN0IHNob3J0TWVzc2FnZSA9IGlzRXJyb3IgPyBgJHtleGVjYU1lc3NhZ2V9XFxuJHtlcnJvci5tZXNzYWdlfWAgOiBleGVjYU1lc3NhZ2U7XG5cdGNvbnN0IG1lc3NhZ2UgPSBbc2hvcnRNZXNzYWdlLCBzdGRlcnIsIHN0ZG91dF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJ1xcbicpO1xuXG5cdGlmIChpc0Vycm9yKSB7XG5cdFx0ZXJyb3Iub3JpZ2luYWxNZXNzYWdlID0gZXJyb3IubWVzc2FnZTtcblx0XHRlcnJvci5tZXNzYWdlID0gbWVzc2FnZTtcblx0fSBlbHNlIHtcblx0XHRlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0fVxuXG5cdGVycm9yLnNob3J0TWVzc2FnZSA9IHNob3J0TWVzc2FnZTtcblx0ZXJyb3IuY29tbWFuZCA9IGNvbW1hbmQ7XG5cdGVycm9yLmVzY2FwZWRDb21tYW5kID0gZXNjYXBlZENvbW1hbmQ7XG5cdGVycm9yLmV4aXRDb2RlID0gZXhpdENvZGU7XG5cdGVycm9yLnNpZ25hbCA9IHNpZ25hbDtcblx0ZXJyb3Iuc2lnbmFsRGVzY3JpcHRpb24gPSBzaWduYWxEZXNjcmlwdGlvbjtcblx0ZXJyb3Iuc3Rkb3V0ID0gc3Rkb3V0O1xuXHRlcnJvci5zdGRlcnIgPSBzdGRlcnI7XG5cblx0aWYgKGFsbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0ZXJyb3IuYWxsID0gYWxsO1xuXHR9XG5cblx0aWYgKCdidWZmZXJlZERhdGEnIGluIGVycm9yKSB7XG5cdFx0ZGVsZXRlIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxuXG5cdGVycm9yLmZhaWxlZCA9IHRydWU7XG5cdGVycm9yLnRpbWVkT3V0ID0gQm9vbGVhbih0aW1lZE91dCk7XG5cdGVycm9yLmlzQ2FuY2VsZWQgPSBpc0NhbmNlbGVkO1xuXHRlcnJvci5raWxsZWQgPSBraWxsZWQgJiYgIXRpbWVkT3V0O1xuXG5cdHJldHVybiBlcnJvcjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWFrZUVycm9yO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IGFsaWFzZXMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuY29uc3QgaGFzQWxpYXMgPSBvcHRpb25zID0+IGFsaWFzZXMuc29tZShhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSAhPT0gdW5kZWZpbmVkKTtcblxuY29uc3Qgbm9ybWFsaXplU3RkaW8gPSBvcHRpb25zID0+IHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qge3N0ZGlvfSA9IG9wdGlvbnM7XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYWxpYXNlcy5tYXAoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10pO1xuXHR9XG5cblx0aWYgKGhhc0FsaWFzKG9wdGlvbnMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBJdCdzIG5vdCBwb3NzaWJsZSB0byBwcm92aWRlIFxcYHN0ZGlvXFxgIGluIGNvbWJpbmF0aW9uIHdpdGggb25lIG9mICR7YWxpYXNlcy5tYXAoYWxpYXMgPT4gYFxcYCR7YWxpYXN9XFxgYCkuam9pbignLCAnKX1gKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHN0ZGlvKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYHN0ZGlvXFxgIHRvIGJlIG9mIHR5cGUgXFxgc3RyaW5nXFxgIG9yIFxcYEFycmF5XFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RkaW99XFxgYCk7XG5cdH1cblxuXHRjb25zdCBsZW5ndGggPSBNYXRoLm1heChzdGRpby5sZW5ndGgsIGFsaWFzZXMubGVuZ3RoKTtcblx0cmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sICh2YWx1ZSwgaW5kZXgpID0+IHN0ZGlvW2luZGV4XSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZVN0ZGlvO1xuXG4vLyBgaXBjYCBpcyBwdXNoZWQgdW5sZXNzIGl0IGlzIGFscmVhZHkgcHJlc2VudFxubW9kdWxlLmV4cG9ydHMubm9kZSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChzdGRpbyA9PT0gJ2lwYycpIHtcblx0XHRyZXR1cm4gJ2lwYyc7XG5cdH1cblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIFtzdGRpbywgc3RkaW8sIHN0ZGlvLCAnaXBjJ107XG5cdH1cblxuXHRpZiAoc3RkaW8uaW5jbHVkZXMoJ2lwYycpKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0cmV0dXJuIFsuLi5zdGRpbywgJ2lwYyddO1xufTtcbiIsICIvLyBUaGlzIGlzIG5vdCB0aGUgc2V0IG9mIGFsbCBwb3NzaWJsZSBzaWduYWxzLlxuLy9cbi8vIEl0IElTLCBob3dldmVyLCB0aGUgc2V0IG9mIGFsbCBzaWduYWxzIHRoYXQgdHJpZ2dlclxuLy8gYW4gZXhpdCBvbiBlaXRoZXIgTGludXggb3IgQlNEIHN5c3RlbXMuICBMaW51eCBpcyBhXG4vLyBzdXBlcnNldCBvZiB0aGUgc2lnbmFsIG5hbWVzIHN1cHBvcnRlZCBvbiBCU0QsIGFuZFxuLy8gdGhlIHVua25vd24gc2lnbmFscyBqdXN0IGZhaWwgdG8gcmVnaXN0ZXIsIHNvIHdlIGNhblxuLy8gY2F0Y2ggdGhhdCBlYXNpbHkgZW5vdWdoLlxuLy9cbi8vIERvbid0IGJvdGhlciB3aXRoIFNJR0tJTEwuICBJdCdzIHVuY2F0Y2hhYmxlLCB3aGljaFxuLy8gbWVhbnMgdGhhdCB3ZSBjYW4ndCBmaXJlIGFueSBjYWxsYmFja3MgYW55d2F5LlxuLy9cbi8vIElmIGEgdXNlciBkb2VzIGhhcHBlbiB0byByZWdpc3RlciBhIGhhbmRsZXIgb24gYSBub24tXG4vLyBmYXRhbCBzaWduYWwgbGlrZSBTSUdXSU5DSCBvciBzb21ldGhpbmcsIGFuZCB0aGVuXG4vLyBleGl0LCBpdCdsbCBlbmQgdXAgZmlyaW5nIGBwcm9jZXNzLmVtaXQoJ2V4aXQnKWAsIHNvXG4vLyB0aGUgaGFuZGxlciB3aWxsIGJlIGZpcmVkIGFueXdheS5cbi8vXG4vLyBTSUdCVVMsIFNJR0ZQRSwgU0lHU0VHViBhbmQgU0lHSUxMLCB3aGVuIG5vdCByYWlzZWRcbi8vIGFydGlmaWNpYWxseSwgaW5oZXJlbnRseSBsZWF2ZSB0aGUgcHJvY2VzcyBpbiBhXG4vLyBzdGF0ZSBmcm9tIHdoaWNoIGl0IGlzIG5vdCBzYWZlIHRvIHRyeSBhbmQgZW50ZXIgSlNcbi8vIGxpc3RlbmVycy5cbm1vZHVsZS5leHBvcnRzID0gW1xuICAnU0lHQUJSVCcsXG4gICdTSUdBTFJNJyxcbiAgJ1NJR0hVUCcsXG4gICdTSUdJTlQnLFxuICAnU0lHVEVSTSdcbl1cblxuaWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICd3aW4zMicpIHtcbiAgbW9kdWxlLmV4cG9ydHMucHVzaChcbiAgICAnU0lHVlRBTFJNJyxcbiAgICAnU0lHWENQVScsXG4gICAgJ1NJR1hGU1onLFxuICAgICdTSUdVU1IyJyxcbiAgICAnU0lHVFJBUCcsXG4gICAgJ1NJR1NZUycsXG4gICAgJ1NJR1FVSVQnLFxuICAgICdTSUdJT1QnXG4gICAgLy8gc2hvdWxkIGRldGVjdCBwcm9maWxlciBhbmQgZW5hYmxlL2Rpc2FibGUgYWNjb3JkaW5nbHkuXG4gICAgLy8gc2VlICMyMVxuICAgIC8vICdTSUdQUk9GJ1xuICApXG59XG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnbGludXgnKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR0lPJyxcbiAgICAnU0lHUE9MTCcsXG4gICAgJ1NJR1BXUicsXG4gICAgJ1NJR1NUS0ZMVCcsXG4gICAgJ1NJR1VOVVNFRCdcbiAgKVxufVxuIiwgIi8vIE5vdGU6IHNpbmNlIG55YyB1c2VzIHRoaXMgbW9kdWxlIHRvIG91dHB1dCBjb3ZlcmFnZSwgYW55IGxpbmVzXG4vLyB0aGF0IGFyZSBpbiB0aGUgZGlyZWN0IHN5bmMgZmxvdyBvZiBueWMncyBvdXRwdXRDb3ZlcmFnZSBhcmVcbi8vIGlnbm9yZWQsIHNpbmNlIHdlIGNhbiBuZXZlciBnZXQgY292ZXJhZ2UgZm9yIHRoZW0uXG4vLyBncmFiIGEgcmVmZXJlbmNlIHRvIG5vZGUncyByZWFsIHByb2Nlc3Mgb2JqZWN0IHJpZ2h0IGF3YXlcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3NcblxuY29uc3QgcHJvY2Vzc09rID0gZnVuY3Rpb24gKHByb2Nlc3MpIHtcbiAgcmV0dXJuIHByb2Nlc3MgJiZcbiAgICB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZWFsbHlFeGl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MubGlzdGVuZXJzID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mua2lsbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnBpZCA9PT0gJ251bWJlcicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG4vLyBzb21lIGtpbmQgb2Ygbm9uLW5vZGUgZW52aXJvbm1lbnQsIGp1c3Qgbm8tb3Bcbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKCFwcm9jZXNzT2socHJvY2VzcykpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9XG4gIH1cbn0gZWxzZSB7XG4gIHZhciBhc3NlcnQgPSByZXF1aXJlKCdhc3NlcnQnKVxuICB2YXIgc2lnbmFscyA9IHJlcXVpcmUoJy4vc2lnbmFscy5qcycpXG4gIHZhciBpc1dpbiA9IC9ed2luL2kudGVzdChwcm9jZXNzLnBsYXRmb3JtKVxuXG4gIHZhciBFRSA9IHJlcXVpcmUoJ2V2ZW50cycpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodHlwZW9mIEVFICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgRUUgPSBFRS5FdmVudEVtaXR0ZXJcbiAgfVxuXG4gIHZhciBlbWl0dGVyXG4gIGlmIChwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fKSB7XG4gICAgZW1pdHRlciA9IHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX19cbiAgfSBlbHNlIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfXyA9IG5ldyBFRSgpXG4gICAgZW1pdHRlci5jb3VudCA9IDBcbiAgICBlbWl0dGVyLmVtaXR0ZWQgPSB7fVxuICB9XG5cbiAgLy8gQmVjYXVzZSB0aGlzIGVtaXR0ZXIgaXMgYSBnbG9iYWwsIHdlIGhhdmUgdG8gY2hlY2sgdG8gc2VlIGlmIGFcbiAgLy8gcHJldmlvdXMgdmVyc2lvbiBvZiB0aGlzIGxpYnJhcnkgZmFpbGVkIHRvIGVuYWJsZSBpbmZpbml0ZSBsaXN0ZW5lcnMuXG4gIC8vIEkga25vdyB3aGF0IHlvdSdyZSBhYm91dCB0byBzYXkuICBCdXQgbGl0ZXJhbGx5IGV2ZXJ5dGhpbmcgYWJvdXRcbiAgLy8gc2lnbmFsLWV4aXQgaXMgYSBjb21wcm9taXNlIHdpdGggZXZpbC4gIEdldCB1c2VkIHRvIGl0LlxuICBpZiAoIWVtaXR0ZXIuaW5maW5pdGUpIHtcbiAgICBlbWl0dGVyLnNldE1heExpc3RlbmVycyhJbmZpbml0eSlcbiAgICBlbWl0dGVyLmluZmluaXRlID0gdHJ1ZVxuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2IsIG9wdHMpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7fVxuICAgIH1cbiAgICBhc3NlcnQuZXF1YWwodHlwZW9mIGNiLCAnZnVuY3Rpb24nLCAnYSBjYWxsYmFjayBtdXN0IGJlIHByb3ZpZGVkIGZvciBleGl0IGhhbmRsZXInKVxuXG4gICAgaWYgKGxvYWRlZCA9PT0gZmFsc2UpIHtcbiAgICAgIGxvYWQoKVxuICAgIH1cblxuICAgIHZhciBldiA9ICdleGl0J1xuICAgIGlmIChvcHRzICYmIG9wdHMuYWx3YXlzTGFzdCkge1xuICAgICAgZXYgPSAnYWZ0ZXJleGl0J1xuICAgIH1cblxuICAgIHZhciByZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKGV2LCBjYilcbiAgICAgIGlmIChlbWl0dGVyLmxpc3RlbmVycygnZXhpdCcpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgIGVtaXR0ZXIubGlzdGVuZXJzKCdhZnRlcmV4aXQnKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdW5sb2FkKClcbiAgICAgIH1cbiAgICB9XG4gICAgZW1pdHRlci5vbihldiwgY2IpXG5cbiAgICByZXR1cm4gcmVtb3ZlXG4gIH1cblxuICB2YXIgdW5sb2FkID0gZnVuY3Rpb24gdW5sb2FkICgpIHtcbiAgICBpZiAoIWxvYWRlZCB8fCAhcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxvYWRlZCA9IGZhbHNlXG5cbiAgICBzaWduYWxzLmZvckVhY2goZnVuY3Rpb24gKHNpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lcihzaWcsIHNpZ0xpc3RlbmVyc1tzaWddKVxuICAgICAgfSBjYXRjaCAoZXIpIHt9XG4gICAgfSlcbiAgICBwcm9jZXNzLmVtaXQgPSBvcmlnaW5hbFByb2Nlc3NFbWl0XG4gICAgcHJvY2Vzcy5yZWFsbHlFeGl0ID0gb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdFxuICAgIGVtaXR0ZXIuY291bnQgLT0gMVxuICB9XG4gIG1vZHVsZS5leHBvcnRzLnVubG9hZCA9IHVubG9hZFxuXG4gIHZhciBlbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQsIGNvZGUsIHNpZ25hbCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmIChlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZW1pdHRlci5lbWl0dGVkW2V2ZW50XSA9IHRydWVcbiAgICBlbWl0dGVyLmVtaXQoZXZlbnQsIGNvZGUsIHNpZ25hbClcbiAgfVxuXG4gIC8vIHsgPHNpZ25hbD46IDxsaXN0ZW5lciBmbj4sIC4uLiB9XG4gIHZhciBzaWdMaXN0ZW5lcnMgPSB7fVxuICBzaWduYWxzLmZvckVhY2goZnVuY3Rpb24gKHNpZykge1xuICAgIHNpZ0xpc3RlbmVyc1tzaWddID0gZnVuY3Rpb24gbGlzdGVuZXIgKCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gb3RoZXIgbGlzdGVuZXJzLCBhbiBleGl0IGlzIGNvbWluZyFcbiAgICAgIC8vIFNpbXBsZXN0IHdheTogcmVtb3ZlIHVzIGFuZCB0aGVuIHJlLXNlbmQgdGhlIHNpZ25hbC5cbiAgICAgIC8vIFdlIGtub3cgdGhhdCB0aGlzIHdpbGwga2lsbCB0aGUgcHJvY2Vzcywgc28gd2UgY2FuXG4gICAgICAvLyBzYWZlbHkgZW1pdCBub3cuXG4gICAgICB2YXIgbGlzdGVuZXJzID0gcHJvY2Vzcy5saXN0ZW5lcnMoc2lnKVxuICAgICAgaWYgKGxpc3RlbmVycy5sZW5ndGggPT09IGVtaXR0ZXIuY291bnQpIHtcbiAgICAgICAgdW5sb2FkKClcbiAgICAgICAgZW1pdCgnZXhpdCcsIG51bGwsIHNpZylcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZW1pdCgnYWZ0ZXJleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBpZiAoaXNXaW4gJiYgc2lnID09PSAnU0lHSFVQJykge1xuICAgICAgICAgIC8vIFwiU0lHSFVQXCIgdGhyb3dzIGFuIGBFTk9TWVNgIGVycm9yIG9uIFdpbmRvd3MsXG4gICAgICAgICAgLy8gc28gdXNlIGEgc3VwcG9ydGVkIHNpZ25hbCBpbnN0ZWFkXG4gICAgICAgICAgc2lnID0gJ1NJR0lOVCdcbiAgICAgICAgfVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBwcm9jZXNzLmtpbGwocHJvY2Vzcy5waWQsIHNpZylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgbW9kdWxlLmV4cG9ydHMuc2lnbmFscyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gc2lnbmFsc1xuICB9XG5cbiAgdmFyIGxvYWRlZCA9IGZhbHNlXG5cbiAgdmFyIGxvYWQgPSBmdW5jdGlvbiBsb2FkICgpIHtcbiAgICBpZiAobG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gdHJ1ZVxuXG4gICAgLy8gVGhpcyBpcyB0aGUgbnVtYmVyIG9mIG9uU2lnbmFsRXhpdCdzIHRoYXQgYXJlIGluIHBsYXkuXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgc28gdGhhdCB3ZSBjYW4gY291bnQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mXG4gICAgLy8gbGlzdGVuZXJzIG9uIHNpZ25hbHMsIGFuZCBkb24ndCB3YWl0IGZvciB0aGUgb3RoZXIgb25lIHRvXG4gICAgLy8gaGFuZGxlIGl0IGluc3RlYWQgb2YgdXMuXG4gICAgZW1pdHRlci5jb3VudCArPSAxXG5cbiAgICBzaWduYWxzID0gc2lnbmFscy5maWx0ZXIoZnVuY3Rpb24gKHNpZykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvY2Vzcy5vbihzaWcsIHNpZ0xpc3RlbmVyc1tzaWddKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHByb2Nlc3MuZW1pdCA9IHByb2Nlc3NFbWl0XG4gICAgcHJvY2Vzcy5yZWFsbHlFeGl0ID0gcHJvY2Vzc1JlYWxseUV4aXRcbiAgfVxuICBtb2R1bGUuZXhwb3J0cy5sb2FkID0gbG9hZFxuXG4gIHZhciBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0ID0gcHJvY2Vzcy5yZWFsbHlFeGl0XG4gIHZhciBwcm9jZXNzUmVhbGx5RXhpdCA9IGZ1bmN0aW9uIHByb2Nlc3NSZWFsbHlFeGl0IChjb2RlKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IGNvZGUgfHwgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gMFxuICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZW1pdCgnYWZ0ZXJleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQuY2FsbChwcm9jZXNzLCBwcm9jZXNzLmV4aXRDb2RlKVxuICB9XG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc0VtaXQgPSBwcm9jZXNzLmVtaXRcbiAgdmFyIHByb2Nlc3NFbWl0ID0gZnVuY3Rpb24gcHJvY2Vzc0VtaXQgKGV2LCBhcmcpIHtcbiAgICBpZiAoZXYgPT09ICdleGl0JyAmJiBwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGFyZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSBhcmdcbiAgICAgIH1cbiAgICAgIHZhciByZXQgPSBvcmlnaW5hbFByb2Nlc3NFbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBlbWl0KCdleGl0JywgcHJvY2Vzcy5leGl0Q29kZSwgbnVsbClcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHJldHVybiByZXRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxufVxuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IG9uRXhpdCA9IHJlcXVpcmUoJ3NpZ25hbC1leGl0Jyk7XG5cbmNvbnN0IERFRkFVTFRfRk9SQ0VfS0lMTF9USU1FT1VUID0gMTAwMCAqIDU7XG5cbi8vIE1vbmtleS1wYXRjaGVzIGBjaGlsZFByb2Nlc3Mua2lsbCgpYCB0byBhZGQgYGZvcmNlS2lsbEFmdGVyVGltZW91dGAgYmVoYXZpb3JcbmNvbnN0IHNwYXduZWRLaWxsID0gKGtpbGwsIHNpZ25hbCA9ICdTSUdURVJNJywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBraWxsKHNpZ25hbCk7XG5cdHNldEtpbGxUaW1lb3V0KGtpbGwsIHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCk7XG5cdHJldHVybiBraWxsUmVzdWx0O1xufTtcblxuY29uc3Qgc2V0S2lsbFRpbWVvdXQgPSAoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSA9PiB7XG5cdGlmICghc2hvdWxkRm9yY2VLaWxsKHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0aW1lb3V0ID0gZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KG9wdGlvbnMpO1xuXHRjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0a2lsbCgnU0lHS0lMTCcpO1xuXHR9LCB0aW1lb3V0KTtcblxuXHQvLyBHdWFyZGVkIGJlY2F1c2UgdGhlcmUncyBubyBgLnVucmVmKClgIHdoZW4gYGV4ZWNhYCBpcyB1c2VkIGluIHRoZSByZW5kZXJlclxuXHQvLyBwcm9jZXNzIGluIEVsZWN0cm9uLiBUaGlzIGNhbm5vdCBiZSB0ZXN0ZWQgc2luY2Ugd2UgZG9uJ3QgcnVuIHRlc3RzIGluXG5cdC8vIEVsZWN0cm9uLlxuXHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuXHRpZiAodC51bnJlZikge1xuXHRcdHQudW5yZWYoKTtcblx0fVxufTtcblxuY29uc3Qgc2hvdWxkRm9yY2VLaWxsID0gKHNpZ25hbCwge2ZvcmNlS2lsbEFmdGVyVGltZW91dH0sIGtpbGxSZXN1bHQpID0+IHtcblx0cmV0dXJuIGlzU2lndGVybShzaWduYWwpICYmIGZvcmNlS2lsbEFmdGVyVGltZW91dCAhPT0gZmFsc2UgJiYga2lsbFJlc3VsdDtcbn07XG5cbmNvbnN0IGlzU2lndGVybSA9IHNpZ25hbCA9PiB7XG5cdHJldHVybiBzaWduYWwgPT09IG9zLmNvbnN0YW50cy5zaWduYWxzLlNJR1RFUk0gfHxcblx0XHQodHlwZW9mIHNpZ25hbCA9PT0gJ3N0cmluZycgJiYgc2lnbmFsLnRvVXBwZXJDYXNlKCkgPT09ICdTSUdURVJNJyk7XG59O1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5jb25zdCBzcGF3bmVkQ2FuY2VsID0gKHNwYXduZWQsIGNvbnRleHQpID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IHNwYXduZWQua2lsbCgpO1xuXG5cdGlmIChraWxsUmVzdWx0KSB7XG5cdFx0Y29udGV4dC5pc0NhbmNlbGVkID0gdHJ1ZTtcblx0fVxufTtcblxuY29uc3QgdGltZW91dEtpbGwgPSAoc3Bhd25lZCwgc2lnbmFsLCByZWplY3QpID0+IHtcblx0c3Bhd25lZC5raWxsKHNpZ25hbCk7XG5cdHJlamVjdChPYmplY3QuYXNzaWduKG5ldyBFcnJvcignVGltZWQgb3V0JyksIHt0aW1lZE91dDogdHJ1ZSwgc2lnbmFsfSkpO1xufTtcblxuLy8gYHRpbWVvdXRgIG9wdGlvbiBoYW5kbGluZ1xuY29uc3Qgc2V0dXBUaW1lb3V0ID0gKHNwYXduZWQsIHt0aW1lb3V0LCBraWxsU2lnbmFsID0gJ1NJR1RFUk0nfSwgc3Bhd25lZFByb21pc2UpID0+IHtcblx0aWYgKHRpbWVvdXQgPT09IDAgfHwgdGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHNwYXduZWRQcm9taXNlO1xuXHR9XG5cblx0bGV0IHRpbWVvdXRJZDtcblx0Y29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0dGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aW1lb3V0S2lsbChzcGF3bmVkLCBraWxsU2lnbmFsLCByZWplY3QpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9KTtcblxuXHRjb25zdCBzYWZlU3Bhd25lZFByb21pc2UgPSBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dElkKTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2UucmFjZShbdGltZW91dFByb21pc2UsIHNhZmVTcGF3bmVkUHJvbWlzZV0pO1xufTtcblxuY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmNvbnN0IHNldEV4aXRIYW5kbGVyID0gYXN5bmMgKHNwYXduZWQsIHtjbGVhbnVwLCBkZXRhY2hlZH0sIHRpbWVkUHJvbWlzZSkgPT4ge1xuXHRpZiAoIWNsZWFudXAgfHwgZGV0YWNoZWQpIHtcblx0XHRyZXR1cm4gdGltZWRQcm9taXNlO1xuXHR9XG5cblx0Y29uc3QgcmVtb3ZlRXhpdEhhbmRsZXIgPSBvbkV4aXQoKCkgPT4ge1xuXHRcdHNwYXduZWQua2lsbCgpO1xuXHR9KTtcblxuXHRyZXR1cm4gdGltZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdHJlbW92ZUV4aXRIYW5kbGVyKCk7XG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNwYXduZWRLaWxsLFxuXHRzcGF3bmVkQ2FuY2VsLFxuXHRzZXR1cFRpbWVvdXQsXG5cdHZhbGlkYXRlVGltZW91dCxcblx0c2V0RXhpdEhhbmRsZXJcbn07XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc1N0cmVhbSA9IHN0cmVhbSA9PlxuXHRzdHJlYW0gIT09IG51bGwgJiZcblx0dHlwZW9mIHN0cmVhbSA9PT0gJ29iamVjdCcgJiZcblx0dHlwZW9mIHN0cmVhbS5waXBlID09PSAnZnVuY3Rpb24nO1xuXG5pc1N0cmVhbS53cml0YWJsZSA9IHN0cmVhbSA9PlxuXHRpc1N0cmVhbShzdHJlYW0pICYmXG5cdHN0cmVhbS53cml0YWJsZSAhPT0gZmFsc2UgJiZcblx0dHlwZW9mIHN0cmVhbS5fd3JpdGUgPT09ICdmdW5jdGlvbicgJiZcblx0dHlwZW9mIHN0cmVhbS5fd3JpdGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG5cbmlzU3RyZWFtLnJlYWRhYmxlID0gc3RyZWFtID0+XG5cdGlzU3RyZWFtKHN0cmVhbSkgJiZcblx0c3RyZWFtLnJlYWRhYmxlICE9PSBmYWxzZSAmJlxuXHR0eXBlb2Ygc3RyZWFtLl9yZWFkID09PSAnZnVuY3Rpb24nICYmXG5cdHR5cGVvZiBzdHJlYW0uX3JlYWRhYmxlU3RhdGUgPT09ICdvYmplY3QnO1xuXG5pc1N0cmVhbS5kdXBsZXggPSBzdHJlYW0gPT5cblx0aXNTdHJlYW0ud3JpdGFibGUoc3RyZWFtKSAmJlxuXHRpc1N0cmVhbS5yZWFkYWJsZShzdHJlYW0pO1xuXG5pc1N0cmVhbS50cmFuc2Zvcm0gPSBzdHJlYW0gPT5cblx0aXNTdHJlYW0uZHVwbGV4KHN0cmVhbSkgJiZcblx0dHlwZW9mIHN0cmVhbS5fdHJhbnNmb3JtID09PSAnZnVuY3Rpb24nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyZWFtO1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHtQYXNzVGhyb3VnaDogUGFzc1Rocm91Z2hTdHJlYW19ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gb3B0aW9ucyA9PiB7XG5cdG9wdGlvbnMgPSB7Li4ub3B0aW9uc307XG5cblx0Y29uc3Qge2FycmF5fSA9IG9wdGlvbnM7XG5cdGxldCB7ZW5jb2Rpbmd9ID0gb3B0aW9ucztcblx0Y29uc3QgaXNCdWZmZXIgPSBlbmNvZGluZyA9PT0gJ2J1ZmZlcic7XG5cdGxldCBvYmplY3RNb2RlID0gZmFsc2U7XG5cblx0aWYgKGFycmF5KSB7XG5cdFx0b2JqZWN0TW9kZSA9ICEoZW5jb2RpbmcgfHwgaXNCdWZmZXIpO1xuXHR9IGVsc2Uge1xuXHRcdGVuY29kaW5nID0gZW5jb2RpbmcgfHwgJ3V0ZjgnO1xuXHR9XG5cblx0aWYgKGlzQnVmZmVyKSB7XG5cdFx0ZW5jb2RpbmcgPSBudWxsO1xuXHR9XG5cblx0Y29uc3Qgc3RyZWFtID0gbmV3IFBhc3NUaHJvdWdoU3RyZWFtKHtvYmplY3RNb2RlfSk7XG5cblx0aWYgKGVuY29kaW5nKSB7XG5cdFx0c3RyZWFtLnNldEVuY29kaW5nKGVuY29kaW5nKTtcblx0fVxuXG5cdGxldCBsZW5ndGggPSAwO1xuXHRjb25zdCBjaHVua3MgPSBbXTtcblxuXHRzdHJlYW0ub24oJ2RhdGEnLCBjaHVuayA9PiB7XG5cdFx0Y2h1bmtzLnB1c2goY2h1bmspO1xuXG5cdFx0aWYgKG9iamVjdE1vZGUpIHtcblx0XHRcdGxlbmd0aCA9IGNodW5rcy5sZW5ndGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxlbmd0aCArPSBjaHVuay5sZW5ndGg7XG5cdFx0fVxuXHR9KTtcblxuXHRzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSA9ICgpID0+IHtcblx0XHRpZiAoYXJyYXkpIHtcblx0XHRcdHJldHVybiBjaHVua3M7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlzQnVmZmVyID8gQnVmZmVyLmNvbmNhdChjaHVua3MsIGxlbmd0aCkgOiBjaHVua3Muam9pbignJyk7XG5cdH07XG5cblx0c3RyZWFtLmdldEJ1ZmZlcmVkTGVuZ3RoID0gKCkgPT4gbGVuZ3RoO1xuXG5cdHJldHVybiBzdHJlYW07XG59O1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHtjb25zdGFudHM6IEJ1ZmZlckNvbnN0YW50c30gPSByZXF1aXJlKCdidWZmZXInKTtcbmNvbnN0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3Qge3Byb21pc2lmeX0gPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBidWZmZXJTdHJlYW0gPSByZXF1aXJlKCcuL2J1ZmZlci1zdHJlYW0nKTtcblxuY29uc3Qgc3RyZWFtUGlwZWxpbmVQcm9taXNpZmllZCA9IHByb21pc2lmeShzdHJlYW0ucGlwZWxpbmUpO1xuXG5jbGFzcyBNYXhCdWZmZXJFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoJ21heEJ1ZmZlciBleGNlZWRlZCcpO1xuXHRcdHRoaXMubmFtZSA9ICdNYXhCdWZmZXJFcnJvcic7XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U3RyZWFtKGlucHV0U3RyZWFtLCBvcHRpb25zKSB7XG5cdGlmICghaW5wdXRTdHJlYW0pIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGEgc3RyZWFtJyk7XG5cdH1cblxuXHRvcHRpb25zID0ge1xuXHRcdG1heEJ1ZmZlcjogSW5maW5pdHksXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGNvbnN0IHttYXhCdWZmZXJ9ID0gb3B0aW9ucztcblx0Y29uc3Qgc3RyZWFtID0gYnVmZmVyU3RyZWFtKG9wdGlvbnMpO1xuXG5cdGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRjb25zdCByZWplY3RQcm9taXNlID0gZXJyb3IgPT4ge1xuXHRcdFx0Ly8gRG9uJ3QgcmV0cmlldmUgYW4gb3ZlcnNpemVkIGJ1ZmZlci5cblx0XHRcdGlmIChlcnJvciAmJiBzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA8PSBCdWZmZXJDb25zdGFudHMuTUFYX0xFTkdUSCkge1xuXHRcdFx0XHRlcnJvci5idWZmZXJlZERhdGEgPSBzdHJlYW0uZ2V0QnVmZmVyZWRWYWx1ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH07XG5cblx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgc3RyZWFtUGlwZWxpbmVQcm9taXNpZmllZChpbnB1dFN0cmVhbSwgc3RyZWFtKTtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0cmVqZWN0UHJvbWlzZShlcnJvcik7XG5cdFx0XHR9XG5cdFx0fSkoKTtcblxuXHRcdHN0cmVhbS5vbignZGF0YScsICgpID0+IHtcblx0XHRcdGlmIChzdHJlYW0uZ2V0QnVmZmVyZWRMZW5ndGgoKSA+IG1heEJ1ZmZlcikge1xuXHRcdFx0XHRyZWplY3RQcm9taXNlKG5ldyBNYXhCdWZmZXJFcnJvcigpKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG5cblx0cmV0dXJuIHN0cmVhbS5nZXRCdWZmZXJlZFZhbHVlKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3RyZWFtO1xubW9kdWxlLmV4cG9ydHMuYnVmZmVyID0gKHN0cmVhbSwgb3B0aW9ucykgPT4gZ2V0U3RyZWFtKHN0cmVhbSwgey4uLm9wdGlvbnMsIGVuY29kaW5nOiAnYnVmZmVyJ30pO1xubW9kdWxlLmV4cG9ydHMuYXJyYXkgPSAoc3RyZWFtLCBvcHRpb25zKSA9PiBnZXRTdHJlYW0oc3RyZWFtLCB7Li4ub3B0aW9ucywgYXJyYXk6IHRydWV9KTtcbm1vZHVsZS5leHBvcnRzLk1heEJ1ZmZlckVycm9yID0gTWF4QnVmZmVyRXJyb3I7XG4iLCAiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB7IFBhc3NUaHJvdWdoIH0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoLypzdHJlYW1zLi4uKi8pIHtcbiAgdmFyIHNvdXJjZXMgPSBbXVxuICB2YXIgb3V0cHV0ICA9IG5ldyBQYXNzVGhyb3VnaCh7b2JqZWN0TW9kZTogdHJ1ZX0pXG5cbiAgb3V0cHV0LnNldE1heExpc3RlbmVycygwKVxuXG4gIG91dHB1dC5hZGQgPSBhZGRcbiAgb3V0cHV0LmlzRW1wdHkgPSBpc0VtcHR5XG5cbiAgb3V0cHV0Lm9uKCd1bnBpcGUnLCByZW1vdmUpXG5cbiAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5mb3JFYWNoKGFkZClcblxuICByZXR1cm4gb3V0cHV0XG5cbiAgZnVuY3Rpb24gYWRkIChzb3VyY2UpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICBzb3VyY2UuZm9yRWFjaChhZGQpXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIHNvdXJjZXMucHVzaChzb3VyY2UpO1xuICAgIHNvdXJjZS5vbmNlKCdlbmQnLCByZW1vdmUuYmluZChudWxsLCBzb3VyY2UpKVxuICAgIHNvdXJjZS5vbmNlKCdlcnJvcicsIG91dHB1dC5lbWl0LmJpbmQob3V0cHV0LCAnZXJyb3InKSlcbiAgICBzb3VyY2UucGlwZShvdXRwdXQsIHtlbmQ6IGZhbHNlfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZnVuY3Rpb24gaXNFbXB0eSAoKSB7XG4gICAgcmV0dXJuIHNvdXJjZXMubGVuZ3RoID09IDA7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmUgKHNvdXJjZSkge1xuICAgIHNvdXJjZXMgPSBzb3VyY2VzLmZpbHRlcihmdW5jdGlvbiAoaXQpIHsgcmV0dXJuIGl0ICE9PSBzb3VyY2UgfSlcbiAgICBpZiAoIXNvdXJjZXMubGVuZ3RoICYmIG91dHB1dC5yZWFkYWJsZSkgeyBvdXRwdXQuZW5kKCkgfVxuICB9XG59XG4iLCAiJ3VzZSBzdHJpY3QnO1xuY29uc3QgaXNTdHJlYW0gPSByZXF1aXJlKCdpcy1zdHJlYW0nKTtcbmNvbnN0IGdldFN0cmVhbSA9IHJlcXVpcmUoJ2dldC1zdHJlYW0nKTtcbmNvbnN0IG1lcmdlU3RyZWFtID0gcmVxdWlyZSgnbWVyZ2Utc3RyZWFtJyk7XG5cbi8vIGBpbnB1dGAgb3B0aW9uXG5jb25zdCBoYW5kbGVJbnB1dCA9IChzcGF3bmVkLCBpbnB1dCkgPT4ge1xuXHQvLyBDaGVja2luZyBmb3Igc3RkaW4gaXMgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy8yNjg1MlxuXHQvLyBAdG9kbyByZW1vdmUgYHx8IHNwYXduZWQuc3RkaW4gPT09IHVuZGVmaW5lZGAgb25jZSB3ZSBkcm9wIHN1cHBvcnQgZm9yIE5vZGUuanMgPD0xMi4yLjBcblx0aWYgKGlucHV0ID09PSB1bmRlZmluZWQgfHwgc3Bhd25lZC5zdGRpbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKGlzU3RyZWFtKGlucHV0KSkge1xuXHRcdGlucHV0LnBpcGUoc3Bhd25lZC5zdGRpbik7XG5cdH0gZWxzZSB7XG5cdFx0c3Bhd25lZC5zdGRpbi5lbmQoaW5wdXQpO1xuXHR9XG59O1xuXG4vLyBgYWxsYCBpbnRlcmxlYXZlcyBgc3Rkb3V0YCBhbmQgYHN0ZGVycmBcbmNvbnN0IG1ha2VBbGxTdHJlYW0gPSAoc3Bhd25lZCwge2FsbH0pID0+IHtcblx0aWYgKCFhbGwgfHwgKCFzcGF3bmVkLnN0ZG91dCAmJiAhc3Bhd25lZC5zdGRlcnIpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgbWl4ZWQgPSBtZXJnZVN0cmVhbSgpO1xuXG5cdGlmIChzcGF3bmVkLnN0ZG91dCkge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZG91dCk7XG5cdH1cblxuXHRpZiAoc3Bhd25lZC5zdGRlcnIpIHtcblx0XHRtaXhlZC5hZGQoc3Bhd25lZC5zdGRlcnIpO1xuXHR9XG5cblx0cmV0dXJuIG1peGVkO1xufTtcblxuLy8gT24gZmFpbHVyZSwgYHJlc3VsdC5zdGRvdXR8c3RkZXJyfGFsbGAgc2hvdWxkIGNvbnRhaW4gdGhlIGN1cnJlbnRseSBidWZmZXJlZCBzdHJlYW1cbmNvbnN0IGdldEJ1ZmZlcmVkRGF0YSA9IGFzeW5jIChzdHJlYW0sIHN0cmVhbVByb21pc2UpID0+IHtcblx0aWYgKCFzdHJlYW0pIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzdHJlYW0uZGVzdHJveSgpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGF3YWl0IHN0cmVhbVByb21pc2U7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIGVycm9yLmJ1ZmZlcmVkRGF0YTtcblx0fVxufTtcblxuY29uc3QgZ2V0U3RyZWFtUHJvbWlzZSA9IChzdHJlYW0sIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KSA9PiB7XG5cdGlmICghc3RyZWFtIHx8ICFidWZmZXIpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoZW5jb2RpbmcpIHtcblx0XHRyZXR1cm4gZ2V0U3RyZWFtKHN0cmVhbSwge2VuY29kaW5nLCBtYXhCdWZmZXJ9KTtcblx0fVxuXG5cdHJldHVybiBnZXRTdHJlYW0uYnVmZmVyKHN0cmVhbSwge21heEJ1ZmZlcn0pO1xufTtcblxuLy8gUmV0cmlldmUgcmVzdWx0IG9mIGNoaWxkIHByb2Nlc3M6IGV4aXQgY29kZSwgc2lnbmFsLCBlcnJvciwgc3RyZWFtcyAoc3Rkb3V0L3N0ZGVyci9hbGwpXG5jb25zdCBnZXRTcGF3bmVkUmVzdWx0ID0gYXN5bmMgKHtzdGRvdXQsIHN0ZGVyciwgYWxsfSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0sIHByb2Nlc3NEb25lKSA9PiB7XG5cdGNvbnN0IHN0ZG91dFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZG91dCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBzdGRlcnJQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRlcnIsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3QgYWxsUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2UoYWxsLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyOiBtYXhCdWZmZXIgKiAyfSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW3Byb2Nlc3NEb25lLCBzdGRvdXRQcm9taXNlLCBzdGRlcnJQcm9taXNlLCBhbGxQcm9taXNlXSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdHtlcnJvciwgc2lnbmFsOiBlcnJvci5zaWduYWwsIHRpbWVkT3V0OiBlcnJvci50aW1lZE91dH0sXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3Rkb3V0LCBzdGRvdXRQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRlcnIsIHN0ZGVyclByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKGFsbCwgYWxsUHJvbWlzZSlcblx0XHRdKTtcblx0fVxufTtcblxuY29uc3QgdmFsaWRhdGVJbnB1dFN5bmMgPSAoe2lucHV0fSkgPT4ge1xuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIGBpbnB1dGAgb3B0aW9uIGNhbm5vdCBiZSBhIHN0cmVhbSBpbiBzeW5jIG1vZGUnKTtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGhhbmRsZUlucHV0LFxuXHRtYWtlQWxsU3RyZWFtLFxuXHRnZXRTcGF3bmVkUmVzdWx0LFxuXHR2YWxpZGF0ZUlucHV0U3luY1xufTtcblxuIiwgIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbmF0aXZlUHJvbWlzZVByb3RvdHlwZSA9IChhc3luYyAoKSA9PiB7fSkoKS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG5jb25zdCBkZXNjcmlwdG9ycyA9IFsndGhlbicsICdjYXRjaCcsICdmaW5hbGx5J10ubWFwKHByb3BlcnR5ID0+IFtcblx0cHJvcGVydHksXG5cdFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5hdGl2ZVByb21pc2VQcm90b3R5cGUsIHByb3BlcnR5KVxuXSk7XG5cbi8vIFRoZSByZXR1cm4gdmFsdWUgaXMgYSBtaXhpbiBvZiBgY2hpbGRQcm9jZXNzYCBhbmQgYFByb21pc2VgXG5jb25zdCBtZXJnZVByb21pc2UgPSAoc3Bhd25lZCwgcHJvbWlzZSkgPT4ge1xuXHRmb3IgKGNvbnN0IFtwcm9wZXJ0eSwgZGVzY3JpcHRvcl0gb2YgZGVzY3JpcHRvcnMpIHtcblx0XHQvLyBTdGFydGluZyB0aGUgbWFpbiBgcHJvbWlzZWAgaXMgZGVmZXJyZWQgdG8gYXZvaWQgY29uc3VtaW5nIHN0cmVhbXNcblx0XHRjb25zdCB2YWx1ZSA9IHR5cGVvZiBwcm9taXNlID09PSAnZnVuY3Rpb24nID9cblx0XHRcdCguLi5hcmdzKSA9PiBSZWZsZWN0LmFwcGx5KGRlc2NyaXB0b3IudmFsdWUsIHByb21pc2UoKSwgYXJncykgOlxuXHRcdFx0ZGVzY3JpcHRvci52YWx1ZS5iaW5kKHByb21pc2UpO1xuXG5cdFx0UmVmbGVjdC5kZWZpbmVQcm9wZXJ0eShzcGF3bmVkLCBwcm9wZXJ0eSwgey4uLmRlc2NyaXB0b3IsIHZhbHVlfSk7XG5cdH1cblxuXHRyZXR1cm4gc3Bhd25lZDtcbn07XG5cbi8vIFVzZSBwcm9taXNlcyBpbnN0ZWFkIG9mIGBjaGlsZF9wcm9jZXNzYCBldmVudHNcbmNvbnN0IGdldFNwYXduZWRQcm9taXNlID0gc3Bhd25lZCA9PiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0c3Bhd25lZC5vbignZXhpdCcsIChleGl0Q29kZSwgc2lnbmFsKSA9PiB7XG5cdFx0XHRyZXNvbHZlKHtleGl0Q29kZSwgc2lnbmFsfSk7XG5cdFx0fSk7XG5cblx0XHRzcGF3bmVkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0fSk7XG5cblx0XHRpZiAoc3Bhd25lZC5zdGRpbikge1xuXHRcdFx0c3Bhd25lZC5zdGRpbi5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG1lcmdlUHJvbWlzZSxcblx0Z2V0U3Bhd25lZFByb21pc2Vcbn07XG5cbiIsICIndXNlIHN0cmljdCc7XG5jb25zdCBub3JtYWxpemVBcmdzID0gKGZpbGUsIGFyZ3MgPSBbXSkgPT4ge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRyZXR1cm4gW2ZpbGVdO1xuXHR9XG5cblx0cmV0dXJuIFtmaWxlLCAuLi5hcmdzXTtcbn07XG5cbmNvbnN0IE5PX0VTQ0FQRV9SRUdFWFAgPSAvXltcXHcuLV0rJC87XG5jb25zdCBET1VCTEVfUVVPVEVTX1JFR0VYUCA9IC9cIi9nO1xuXG5jb25zdCBlc2NhcGVBcmcgPSBhcmcgPT4ge1xuXHRpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgfHwgTk9fRVNDQVBFX1JFR0VYUC50ZXN0KGFyZykpIHtcblx0XHRyZXR1cm4gYXJnO1xuXHR9XG5cblx0cmV0dXJuIGBcIiR7YXJnLnJlcGxhY2UoRE9VQkxFX1FVT1RFU19SRUdFWFAsICdcXFxcXCInKX1cImA7XG59O1xuXG5jb25zdCBqb2luQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiB7XG5cdHJldHVybiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLmpvaW4oJyAnKTtcbn07XG5cbmNvbnN0IGdldEVzY2FwZWRDb21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IHtcblx0cmV0dXJuIG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykubWFwKGFyZyA9PiBlc2NhcGVBcmcoYXJnKSkuam9pbignICcpO1xufTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuXG4vLyBIYW5kbGUgYGV4ZWNhLmNvbW1hbmQoKWBcbmNvbnN0IHBhcnNlQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuXHRcdC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuXHRcdGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuXHRcdGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoJ1xcXFwnKSkge1xuXHRcdFx0Ly8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuXHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG9rZW5zO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGpvaW5Db21tYW5kLFxuXHRnZXRFc2NhcGVkQ29tbWFuZCxcblx0cGFyc2VDb21tYW5kXG59O1xuIiwgIid1c2Ugc3RyaWN0JztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBjaGlsZFByb2Nlc3MgPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5jb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKTtcbmNvbnN0IHN0cmlwRmluYWxOZXdsaW5lID0gcmVxdWlyZSgnc3RyaXAtZmluYWwtbmV3bGluZScpO1xuY29uc3QgbnBtUnVuUGF0aCA9IHJlcXVpcmUoJ25wbS1ydW4tcGF0aCcpO1xuY29uc3Qgb25ldGltZSA9IHJlcXVpcmUoJ29uZXRpbWUnKTtcbmNvbnN0IG1ha2VFcnJvciA9IHJlcXVpcmUoJy4vbGliL2Vycm9yJyk7XG5jb25zdCBub3JtYWxpemVTdGRpbyA9IHJlcXVpcmUoJy4vbGliL3N0ZGlvJyk7XG5jb25zdCB7c3Bhd25lZEtpbGwsIHNwYXduZWRDYW5jZWwsIHNldHVwVGltZW91dCwgdmFsaWRhdGVUaW1lb3V0LCBzZXRFeGl0SGFuZGxlcn0gPSByZXF1aXJlKCcuL2xpYi9raWxsJyk7XG5jb25zdCB7aGFuZGxlSW5wdXQsIGdldFNwYXduZWRSZXN1bHQsIG1ha2VBbGxTdHJlYW0sIHZhbGlkYXRlSW5wdXRTeW5jfSA9IHJlcXVpcmUoJy4vbGliL3N0cmVhbScpO1xuY29uc3Qge21lcmdlUHJvbWlzZSwgZ2V0U3Bhd25lZFByb21pc2V9ID0gcmVxdWlyZSgnLi9saWIvcHJvbWlzZScpO1xuY29uc3Qge2pvaW5Db21tYW5kLCBwYXJzZUNvbW1hbmQsIGdldEVzY2FwZWRDb21tYW5kfSA9IHJlcXVpcmUoJy4vbGliL2NvbW1hbmQnKTtcblxuY29uc3QgREVGQVVMVF9NQVhfQlVGRkVSID0gMTAwMCAqIDEwMDAgKiAxMDA7XG5cbmNvbnN0IGdldEVudiA9ICh7ZW52OiBlbnZPcHRpb24sIGV4dGVuZEVudiwgcHJlZmVyTG9jYWwsIGxvY2FsRGlyLCBleGVjUGF0aH0pID0+IHtcblx0Y29uc3QgZW52ID0gZXh0ZW5kRW52ID8gey4uLnByb2Nlc3MuZW52LCAuLi5lbnZPcHRpb259IDogZW52T3B0aW9uO1xuXG5cdGlmIChwcmVmZXJMb2NhbCkge1xuXHRcdHJldHVybiBucG1SdW5QYXRoLmVudih7ZW52LCBjd2Q6IGxvY2FsRGlyLCBleGVjUGF0aH0pO1xuXHR9XG5cblx0cmV0dXJuIGVudjtcbn07XG5cbmNvbnN0IGhhbmRsZUFyZ3VtZW50cyA9IChmaWxlLCBhcmdzLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3QgcGFyc2VkID0gY3Jvc3NTcGF3bi5fcGFyc2UoZmlsZSwgYXJncywgb3B0aW9ucyk7XG5cdGZpbGUgPSBwYXJzZWQuY29tbWFuZDtcblx0YXJncyA9IHBhcnNlZC5hcmdzO1xuXHRvcHRpb25zID0gcGFyc2VkLm9wdGlvbnM7XG5cblx0b3B0aW9ucyA9IHtcblx0XHRtYXhCdWZmZXI6IERFRkFVTFRfTUFYX0JVRkZFUixcblx0XHRidWZmZXI6IHRydWUsXG5cdFx0c3RyaXBGaW5hbE5ld2xpbmU6IHRydWUsXG5cdFx0ZXh0ZW5kRW52OiB0cnVlLFxuXHRcdHByZWZlckxvY2FsOiBmYWxzZSxcblx0XHRsb2NhbERpcjogb3B0aW9ucy5jd2QgfHwgcHJvY2Vzcy5jd2QoKSxcblx0XHRleGVjUGF0aDogcHJvY2Vzcy5leGVjUGF0aCxcblx0XHRlbmNvZGluZzogJ3V0ZjgnLFxuXHRcdHJlamVjdDogdHJ1ZSxcblx0XHRjbGVhbnVwOiB0cnVlLFxuXHRcdGFsbDogZmFsc2UsXG5cdFx0d2luZG93c0hpZGU6IHRydWUsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdG9wdGlvbnMuZW52ID0gZ2V0RW52KG9wdGlvbnMpO1xuXG5cdG9wdGlvbnMuc3RkaW8gPSBub3JtYWxpemVTdGRpbyhvcHRpb25zKTtcblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiBwYXRoLmJhc2VuYW1lKGZpbGUsICcuZXhlJykgPT09ICdjbWQnKSB7XG5cdFx0Ly8gIzExNlxuXHRcdGFyZ3MudW5zaGlmdCgnL3EnKTtcblx0fVxuXG5cdHJldHVybiB7ZmlsZSwgYXJncywgb3B0aW9ucywgcGFyc2VkfTtcbn07XG5cbmNvbnN0IGhhbmRsZU91dHB1dCA9IChvcHRpb25zLCB2YWx1ZSwgZXJyb3IpID0+IHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcblx0XHQvLyBXaGVuIGBleGVjYS5zeW5jKClgIGVycm9ycywgd2Ugbm9ybWFsaXplIGl0IHRvICcnIHRvIG1pbWljIGBleGVjYSgpYFxuXHRcdHJldHVybiBlcnJvciA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogJyc7XG5cdH1cblxuXHRpZiAob3B0aW9ucy5zdHJpcEZpbmFsTmV3bGluZSkge1xuXHRcdHJldHVybiBzdHJpcEZpbmFsTmV3bGluZSh2YWx1ZSk7XG5cdH1cblxuXHRyZXR1cm4gdmFsdWU7XG59O1xuXG5jb25zdCBleGVjYSA9IChmaWxlLCBhcmdzLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IHBhcnNlZCA9IGhhbmRsZUFyZ3VtZW50cyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0Y29uc3QgY29tbWFuZCA9IGpvaW5Db21tYW5kKGZpbGUsIGFyZ3MpO1xuXHRjb25zdCBlc2NhcGVkQ29tbWFuZCA9IGdldEVzY2FwZWRDb21tYW5kKGZpbGUsIGFyZ3MpO1xuXG5cdHZhbGlkYXRlVGltZW91dChwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHNwYXduZWQ7XG5cdHRyeSB7XG5cdFx0c3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBFbnN1cmUgdGhlIHJldHVybmVkIGVycm9yIGlzIGFsd2F5cyBib3RoIGEgcHJvbWlzZSBhbmQgYSBjaGlsZCBwcm9jZXNzXG5cdFx0Y29uc3QgZHVtbXlTcGF3bmVkID0gbmV3IGNoaWxkUHJvY2Vzcy5DaGlsZFByb2Nlc3MoKTtcblx0XHRjb25zdCBlcnJvclByb21pc2UgPSBQcm9taXNlLnJlamVjdChtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2Vcblx0XHR9KSk7XG5cdFx0cmV0dXJuIG1lcmdlUHJvbWlzZShkdW1teVNwYXduZWQsIGVycm9yUHJvbWlzZSk7XG5cdH1cblxuXHRjb25zdCBzcGF3bmVkUHJvbWlzZSA9IGdldFNwYXduZWRQcm9taXNlKHNwYXduZWQpO1xuXHRjb25zdCB0aW1lZFByb21pc2UgPSBzZXR1cFRpbWVvdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHNwYXduZWRQcm9taXNlKTtcblx0Y29uc3QgcHJvY2Vzc0RvbmUgPSBzZXRFeGl0SGFuZGxlcihzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgdGltZWRQcm9taXNlKTtcblxuXHRjb25zdCBjb250ZXh0ID0ge2lzQ2FuY2VsZWQ6IGZhbHNlfTtcblxuXHRzcGF3bmVkLmtpbGwgPSBzcGF3bmVkS2lsbC5iaW5kKG51bGwsIHNwYXduZWQua2lsbC5iaW5kKHNwYXduZWQpKTtcblx0c3Bhd25lZC5jYW5jZWwgPSBzcGF3bmVkQ2FuY2VsLmJpbmQobnVsbCwgc3Bhd25lZCwgY29udGV4dCk7XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZSA9IGFzeW5jICgpID0+IHtcblx0XHRjb25zdCBbe2Vycm9yLCBleGl0Q29kZSwgc2lnbmFsLCB0aW1lZE91dH0sIHN0ZG91dFJlc3VsdCwgc3RkZXJyUmVzdWx0LCBhbGxSZXN1bHRdID0gYXdhaXQgZ2V0U3Bhd25lZFJlc3VsdChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgcHJvY2Vzc0RvbmUpO1xuXHRcdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3Rkb3V0UmVzdWx0KTtcblx0XHRjb25zdCBzdGRlcnIgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHN0ZGVyclJlc3VsdCk7XG5cdFx0Y29uc3QgYWxsID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBhbGxSZXN1bHQpO1xuXG5cdFx0aWYgKGVycm9yIHx8IGV4aXRDb2RlICE9PSAwIHx8IHNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgcmV0dXJuZWRFcnJvciA9IG1ha2VFcnJvcih7XG5cdFx0XHRcdGVycm9yLFxuXHRcdFx0XHRleGl0Q29kZSxcblx0XHRcdFx0c2lnbmFsLFxuXHRcdFx0XHRzdGRvdXQsXG5cdFx0XHRcdHN0ZGVycixcblx0XHRcdFx0YWxsLFxuXHRcdFx0XHRjb21tYW5kLFxuXHRcdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdFx0cGFyc2VkLFxuXHRcdFx0XHR0aW1lZE91dCxcblx0XHRcdFx0aXNDYW5jZWxlZDogY29udGV4dC5pc0NhbmNlbGVkLFxuXHRcdFx0XHRraWxsZWQ6IHNwYXduZWQua2lsbGVkXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFwYXJzZWQub3B0aW9ucy5yZWplY3QpIHtcblx0XHRcdFx0cmV0dXJuIHJldHVybmVkRXJyb3I7XG5cdFx0XHR9XG5cblx0XHRcdHRocm93IHJldHVybmVkRXJyb3I7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdGV4aXRDb2RlOiAwLFxuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0YWxsLFxuXHRcdFx0ZmFpbGVkOiBmYWxzZSxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZVxuXHRcdH07XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZU9uY2UgPSBvbmV0aW1lKGhhbmRsZVByb21pc2UpO1xuXG5cdGhhbmRsZUlucHV0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLmlucHV0KTtcblxuXHRzcGF3bmVkLmFsbCA9IG1ha2VBbGxTdHJlYW0oc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMpO1xuXG5cdHJldHVybiBtZXJnZVByb21pc2Uoc3Bhd25lZCwgaGFuZGxlUHJvbWlzZU9uY2UpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleGVjYTtcblxubW9kdWxlLmV4cG9ydHMuc3luYyA9IChmaWxlLCBhcmdzLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IHBhcnNlZCA9IGhhbmRsZUFyZ3VtZW50cyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0Y29uc3QgY29tbWFuZCA9IGpvaW5Db21tYW5kKGZpbGUsIGFyZ3MpO1xuXHRjb25zdCBlc2NhcGVkQ29tbWFuZCA9IGdldEVzY2FwZWRDb21tYW5kKGZpbGUsIGFyZ3MpO1xuXG5cdHZhbGlkYXRlSW5wdXRTeW5jKHBhcnNlZC5vcHRpb25zKTtcblxuXHRsZXQgcmVzdWx0O1xuXHR0cnkge1xuXHRcdHJlc3VsdCA9IGNoaWxkUHJvY2Vzcy5zcGF3blN5bmMocGFyc2VkLmZpbGUsIHBhcnNlZC5hcmdzLCBwYXJzZWQub3B0aW9ucyk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0dGhyb3cgbWFrZUVycm9yKHtcblx0XHRcdGVycm9yLFxuXHRcdFx0c3Rkb3V0OiAnJyxcblx0XHRcdHN0ZGVycjogJycsXG5cdFx0XHRhbGw6ICcnLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlXG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHJlc3VsdC5zdGRvdXQsIHJlc3VsdC5lcnJvcik7XG5cdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZGVyciwgcmVzdWx0LmVycm9yKTtcblxuXHRpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDAgfHwgcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IGVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGVycm9yOiByZXN1bHQuZXJyb3IsXG5cdFx0XHRzaWduYWw6IHJlc3VsdC5zaWduYWwsXG5cdFx0XHRleGl0Q29kZTogcmVzdWx0LnN0YXR1cyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiByZXN1bHQuZXJyb3IgJiYgcmVzdWx0LmVycm9yLmNvZGUgPT09ICdFVElNRURPVVQnLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IHJlc3VsdC5zaWduYWwgIT09IG51bGxcblx0XHR9KTtcblxuXHRcdGlmICghcGFyc2VkLm9wdGlvbnMucmVqZWN0KSB7XG5cdFx0XHRyZXR1cm4gZXJyb3I7XG5cdFx0fVxuXG5cdFx0dGhyb3cgZXJyb3I7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNvbW1hbmQsXG5cdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0ZXhpdENvZGU6IDAsXG5cdFx0c3Rkb3V0LFxuXHRcdHN0ZGVycixcblx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRraWxsZWQ6IGZhbHNlXG5cdH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5jb21tYW5kID0gKGNvbW1hbmQsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2EoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5jb21tYW5kU3luYyA9IChjb21tYW5kLCBvcHRpb25zKSA9PiB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhLnN5bmMoZmlsZSwgYXJncywgb3B0aW9ucyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5ub2RlID0gKHNjcmlwdFBhdGgsIGFyZ3MsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAoYXJncyAmJiAhQXJyYXkuaXNBcnJheShhcmdzKSAmJiB0eXBlb2YgYXJncyA9PT0gJ29iamVjdCcpIHtcblx0XHRvcHRpb25zID0gYXJncztcblx0XHRhcmdzID0gW107XG5cdH1cblxuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvLm5vZGUob3B0aW9ucyk7XG5cdGNvbnN0IGRlZmF1bHRFeGVjQXJndiA9IHByb2Nlc3MuZXhlY0FyZ3YuZmlsdGVyKGFyZyA9PiAhYXJnLnN0YXJ0c1dpdGgoJy0taW5zcGVjdCcpKTtcblxuXHRjb25zdCB7XG5cdFx0bm9kZVBhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdG5vZGVPcHRpb25zID0gZGVmYXVsdEV4ZWNBcmd2XG5cdH0gPSBvcHRpb25zO1xuXG5cdHJldHVybiBleGVjYShcblx0XHRub2RlUGF0aCxcblx0XHRbXG5cdFx0XHQuLi5ub2RlT3B0aW9ucyxcblx0XHRcdHNjcmlwdFBhdGgsXG5cdFx0XHQuLi4oQXJyYXkuaXNBcnJheShhcmdzKSA/IGFyZ3MgOiBbXSlcblx0XHRdLFxuXHRcdHtcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHRzdGRpbjogdW5kZWZpbmVkLFxuXHRcdFx0c3Rkb3V0OiB1bmRlZmluZWQsXG5cdFx0XHRzdGRlcnI6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGlvLFxuXHRcdFx0c2hlbGw6IGZhbHNlXG5cdFx0fVxuXHQpO1xufTtcbiIsICJpbXBvcnQgeyBvcGVuTmV3VGFiIH0gZnJvbSBcIi4vYWN0aW9uc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBDb21tYW5kKCkge1xuICBvcGVuTmV3VGFiKG51bGwpO1xufVxuIiwgImltcG9ydCB7IGNsb3NlTWFpbldpbmRvdywgcG9wVG9Sb290IH0gZnJvbSBcIkByYXljYXN0L2FwaVwiO1xuaW1wb3J0IHsgcnVuQXBwbGVTY3JpcHQgfSBmcm9tIFwicnVuLWFwcGxlc2NyaXB0XCI7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IFRhYiB9IGZyb20gXCIuLi9pbnRlcmZhY2VzXCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuTmV3VGFiKHF1ZXJ5VGV4dDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFByb21pc2U8Ym9vbGVhbiB8IHN0cmluZz4ge1xuIHJldHVybiAhcXVlcnlUZXh0ID8gb3Blbkhpc3RvcnlUYWIoJ2Fib3V0Om5ld3RhYicpICA6IG9wZW5IaXN0b3J5VGFiKGBodHRwczovL2thZ2kuY29tL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5VGV4dCl9YCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuSGlzdG9yeVRhYih1cmw6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbiB8IHN0cmluZz4ge1xuICBwb3BUb1Jvb3QoKTtcbiAgY2xvc2VNYWluV2luZG93KHsgY2xlYXJSb290U2VhcmNoOiB0cnVlIH0pO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgcHJvY2VzcyA9IGV4ZWMoYG9zYXNjcmlwdCAtZSAndGVsbCBhcHBsaWNhdGlvbiBcIkZpbmRlclwiIHRvIGFjdGl2YXRlJyAmJiAvQXBwbGljYXRpb25zL0ZpcmVmb3guYXBwL0NvbnRlbnRzL01hY09TL2ZpcmVmb3ggLS1icm93c2VyYCk7XG5cbiAgICBwcm9jZXNzLm9uKFwiZXhpdFwiLCAoY29kZSkgPT4ge1xuICAgICAgaWYgKGNvZGUgPT09IDApIHtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChcIkZhaWxlZCB0byBvcGVuIHVybFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRBY3RpdmVUYWIodGFiOiBUYWIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgcnVuQXBwbGVTY3JpcHQoYFxuICAgIHRlbGwgYXBwbGljYXRpb24gXCJGaXJlZm94XCJcbiAgICAgIGFjdGl2YXRlXG4gICAgICByZXBlYXQgd2l0aCB3IGZyb20gMSB0byBjb3VudCBvZiB3aW5kb3dzXG4gICAgICAgIHNldCBzdGFydFRhYiB0byBuYW1lIG9mIHdpbmRvdyAxXG4gICAgICAgIHJlcGVhdFxuICAgICAgICAgICAgaWYgbmFtZSBvZiB3aW5kb3cgMSBjb250YWlucyBcIiR7dGFiLnRpdGxlfVwiIHRoZW4gXG4gICAgICAgICAgICAgIGV4aXQgcmVwZWF0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHRlbGwgYXBwbGljYXRpb24gXCJTeXN0ZW0gRXZlbnRzXCIgdG8ga2V5IGNvZGUgNDggdXNpbmcgY29udHJvbCBkb3duXG4gICAgICAgICAgICBlbmQgaWZcbiAgICAgICAgICAgIGlmIG5hbWUgb2Ygd2luZG93IDEgaXMgc3RhcnRUYWIgdGhlbiBleGl0IHJlcGVhdFxuICAgICAgICBlbmQgcmVwZWF0XG4gICAgICBlbmQgcmVwZWF0XG4gICAgZW5kIHRlbGxcbiAgYCk7XG59XG5cbiIsICJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IGV4ZWNhIGZyb20gJ2V4ZWNhJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkFwcGxlU2NyaXB0KHNjcmlwdCkge1xuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSAhPT0gJ2RhcndpbicpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ21hY09TIG9ubHknKTtcblx0fVxuXG5cdGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgZXhlY2EoJ29zYXNjcmlwdCcsIFsnLWUnLCBzY3JpcHRdKTtcblx0cmV0dXJuIHN0ZG91dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bkFwcGxlU2NyaXB0U3luYyhzY3JpcHQpIHtcblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdkYXJ3aW4nKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdtYWNPUyBvbmx5Jyk7XG5cdH1cblxuXHRjb25zdCB7c3Rkb3V0fSA9IGV4ZWNhLnN5bmMoJ29zYXNjcmlwdCcsIFsnLWUnLCBzY3JpcHRdKTtcblx0cmV0dXJuIHN0ZG91dDtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUEsMkNBQUFBLFNBQUE7QUFBQSxJQUFBQSxRQUFPLFVBQVU7QUFDakIsVUFBTSxPQUFPO0FBRWIsUUFBSSxLQUFLLFFBQVEsSUFBSTtBQUVyQixhQUFTLGFBQWMsTUFBTSxTQUFTO0FBQ3BDLFVBQUksVUFBVSxRQUFRLFlBQVksU0FDaEMsUUFB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UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFDRTtRQUNGQyxVQUFVO01BTlo7TUFRQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO1FBQ1ZDLFFBQVE7TUFOVjtNQVFBO1FBQ0VMLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtRQUNWQyxRQUFRO01BTlY7TUFRQTtRQUNFTCxNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7UUFDVkMsUUFBUTtNQU5WO01BUUE7UUFDRUwsTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtRQUNSQyxRQUFRO1FBQ1JDLGFBQWE7UUFDYkMsVUFBVTtNQUxaO01BT0E7UUFDRUosTUFBTTtRQUNOQyxRQUFRO1FBQ1JDLFFBQVE7UUFDUkMsYUFBYTtRQUNiQyxVQUFVO01BTFo7TUFPQTtRQUNFSixNQUFNO1FBQ05DLFFBQVE7UUFDUkMsUUFBUTtRQUNSQyxhQUFhO1FBQ2JDLFVBQVU7TUFMWjtNQU9BO1FBQ0VKLE1BQU07UUFDTkMsUUFBUTtR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QSxNQUNEO0FBQUEsSUFDRDtBQUFBO0FBQUE7OztBQzNRQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQSxpQkFBMkM7OztBQ0MzQyxtQkFBa0I7OztBRENsQiwyQkFBcUI7QUFHckIsZUFBc0IsV0FBVyxXQUFpRTtBQUNqRyxTQUFPLENBQUMsWUFBWSxlQUFlLGNBQWMsSUFBSyxlQUFlLDZCQUE2QixtQkFBbUIsU0FBUyxHQUFHO0FBQ2xJO0FBRUEsZUFBc0IsZUFBZSxLQUF3QztBQUMzRSw0QkFBVTtBQUNWLGtDQUFnQixFQUFFLGlCQUFpQixLQUFLLENBQUM7QUFFekMsU0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDdEMsVUFBTUMsZUFBVSwyQkFBSyxvSEFBb0g7QUFFekksSUFBQUEsU0FBUSxHQUFHLFFBQVEsQ0FBQyxTQUFTO0FBQzNCLFVBQUksU0FBUyxHQUFHO0FBQ2QsZ0JBQVEsSUFBSTtBQUFBLE1BQ2QsT0FBTztBQUNMLGVBQU8sb0JBQW9CO0FBQUEsTUFDN0I7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILENBQUM7QUFDSDs7O0FEdEJBLGVBQU8sVUFBaUM7QUFDdEMsYUFBVyxJQUFJO0FBQ2pCOyIsCiAgIm5hbWVzIjogWyJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJwYXRoIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAib25ldGltZSIsICJTSUdOQUxTIiwgIm5hbWUiLCAibnVtYmVyIiwgImFjdGlvbiIsICJkZXNjcmlwdGlvbiIsICJzdGFuZGFyZCIsICJmb3JjZWQiLCAiZ2V0UmVhbHRpbWVTaWduYWxzIiwgImxlbmd0aCIsICJTSUdSVE1BWCIsICJTSUdSVE1JTiIsICJBcnJheSIsICJmcm9tIiwgImdldFJlYWx0aW1lU2lnbmFsIiwgInZhbHVlIiwgImluZGV4IiwgIm5hbWUiLCAibnVtYmVyIiwgImFjdGlvbiIsICJkZXNjcmlwdGlvbiIsICJzdGFuZGFyZCIsICJnZXRTaWduYWxzIiwgInJlYWx0aW1lU2lnbmFscyIsICJzaWduYWxzIiwgIlNJR05BTFMiLCAibWFwIiwgIm5vcm1hbGl6ZVNpZ25hbCIsICJuYW1lIiwgIm51bWJlciIsICJkZWZhdWx0TnVtYmVyIiwgImRlc2NyaXB0aW9uIiwgImFjdGlvbiIsICJmb3JjZWQiLCAic3RhbmRhcmQiLCAiY29uc3RhbnRTaWduYWwiLCAiY29uc3RhbnRzIiwgInN1cHBvcnRlZCIsICJ1bmRlZmluZWQiLCAiZ2V0U2lnbmFsc0J5TmFtZSIsICJzaWduYWxzIiwgInJlZHVjZSIsICJnZXRTaWduYWxCeU5hbWUiLCAic2lnbmFsQnlOYW1lTWVtbyIsICJuYW1lIiwgIm51bWJlciIsICJkZXNjcmlwdGlvbiIsICJzdXBwb3J0ZWQiLCAiYWN0aW9uIiwgImZvcmNlZCIsICJzdGFuZGFyZCIsICJzaWduYWxzQnlOYW1lIiwgImdldFNpZ25hbHNCeU51bWJlciIsICJsZW5ndGgiLCAiU0lHUlRNQVgiLCAic2lnbmFsc0EiLCAiQXJyYXkiLCAiZnJvbSIsICJ2YWx1ZSIsICJnZXRTaWduYWxCeU51bWJlciIsICJPYmplY3QiLCAiYXNzaWduIiwgInNpZ25hbCIsICJmaW5kU2lnbmFsQnlOdW1iZXIiLCAidW5kZWZpbmVkIiwgImZpbmQiLCAiY29uc3RhbnRzIiwgInNpZ25hbEEiLCAic2lnbmFsc0J5TnVtYmVyIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAicmVxdWlyZV9zaWduYWxzIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAicHJvY2VzcyIsICJ1bmxvYWQiLCAiZW1pdCIsICJsb2FkIiwgInByb2Nlc3NSZWFsbHlFeGl0IiwgInByb2Nlc3NFbWl0IiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJzdHJlYW0iLCAibW9kdWxlIiwgIm1vZHVsZSIsICJtb2R1bGUiLCAibW9kdWxlIiwgIm1vZHVsZSIsICJleGVjYSIsICJwcm9jZXNzIl0KfQo=
