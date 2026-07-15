"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBigInt = serializeBigInt;
function serializeBigInt(obj) {
    //   if (obj === null || obj === undefined) return obj;
    //   if (typeof obj === "bigint") return obj.toString();
    //   if (Array.isArray(obj)) return obj.map(serializeBigInt);
    //   if (typeof obj === "object") {
    //     const result: any = {};
    //     for (const key in obj) {
    //       result[key] = serializeBigInt(obj[key]);
    //     }
    //     return result;
    //   }
    return obj;
}
