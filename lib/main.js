"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
function removeLastDir(dirPath) {
    return dirPath.split("/").slice(0, -1).join("/");
}
function execCDK(args, env) {
    (0, child_process_1.execSync)(`(cd ${removeLastDir(__dirname)} && PATH="${removeLastDir(process.execPath)}:$PATH" node node_modules/aws-cdk/bin/cdk ${args})`, {
        env,
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const AWS_ACCESS_KEY_ID = core.getInput("AWS_ACCESS_KEY_ID");
            const AWS_SECRET_ACCESS_KEY = core.getInput("AWS_SECRET_ACCESS_KEY");
            const CDK_DEFAULT_REGION = (_a = core.getInput("CDK_DEFAULT_REGION")) !== null && _a !== void 0 ? _a : "us-east-1";
            const ORIGIN_PATH = (_b = core.getInput("destination_dir")) !== null && _b !== void 0 ? _b : "";
            const domain = core.getInput("domain");
            if (domain.split(".").length < 2) {
                throw new Error("Invalid domain, examples of correct domains are 'example.com' or 'subdomain.example.org'");
            }
            const raw_publish_dir = core.getInput("publish_dir");
            const publish_dir = path.isAbsolute(raw_publish_dir)
                ? raw_publish_dir
                : path.join(`${process.env.GITHUB_WORKSPACE}`, raw_publish_dir);
            core.info(`Publishing directory '${publish_dir}' to '${domain}'`);
            const awsCredentials = {
                AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY,
                CDK_DEFAULT_REGION,
            };
            execCDK("bootstrap", Object.assign(Object.assign({}, awsCredentials), { DOMAIN: domain, FOLDER: publish_dir, ORIGIN_PATH: ORIGIN_PATH }));
            execCDK("deploy --require-approval never", Object.assign(Object.assign({}, awsCredentials), { DOMAIN: domain, FOLDER: publish_dir, ORIGIN_PATH: ORIGIN_PATH }));
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
