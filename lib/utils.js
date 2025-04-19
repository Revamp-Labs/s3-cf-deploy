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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubdomain = getSubdomain;
exports.getDomain = getDomain;
exports.getDNSZone = getDNSZone;
exports.getCertificate = getCertificate;
exports.setDNSRecord = setDNSRecord;
const cloudfront = __importStar(require("aws-cdk-lib/aws-cloudfront"));
const route53 = __importStar(require("aws-cdk-lib/aws-route53"));
const targets = __importStar(require("aws-cdk-lib/aws-route53-targets"));
const acm = __importStar(require("aws-cdk-lib/aws-certificatemanager"));
function getSubdomain(fullDomain) {
    const subdomainArray = fullDomain.split(".").slice(0, -2);
    if (subdomainArray.length === 0) {
        return null;
    }
    else {
        return subdomainArray.join(".");
    }
}
function getDomain(fullDomain) {
    return fullDomain.split(".").splice(-2, 2).join(".");
}
function getDNSZone(scope, domainName) {
    return route53.HostedZone.fromLookup(scope, "Route53Zone", {
        domainName,
    });
}
function getCertificate(scope, fullDomainName, zone) {
    const acmCert = new acm.DnsValidatedCertificate(scope, "SiteCert", {
        domainName: fullDomainName,
        hostedZone: zone,
    });
    return cloudfront.ViewerCertificate.fromAcmCertificate(acmCert, {
        aliases: [fullDomainName],
    });
}
function setDNSRecord(scope, subdomain, zone, distribution) {
    return new route53.ARecord(scope, "Alias", {
        zone,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
        recordName: subdomain === null ? undefined : subdomain,
    });
}
