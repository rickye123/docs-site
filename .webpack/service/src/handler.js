/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/handler.ts":
/*!************************!*\
  !*** ./src/handler.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getPage = exports.createPage = exports.uploadMarkdown = exports.getMarkdown = exports.listPages = void 0;
const aws_sdk_1 = __importDefault(__webpack_require__(/*! aws-sdk */ "aws-sdk"));
const s3 = new aws_sdk_1.default.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME; // This should be set in the environment or serverless config
const listPages = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!BUCKET_NAME) {
            throw new Error('S3_BUCKET_NAME is not defined');
        }
        const response = yield s3
            .listObjectsV2({ Bucket: BUCKET_NAME, Prefix: "pages/" })
            .promise();
        const files = ((_a = response.Contents) === null || _a === void 0 ? void 0 : _a.map((file) => file.Key)) || [];
        return {
            statusCode: 200,
            body: JSON.stringify({ files }),
        };
    }
    catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
});
exports.listPages = listPages;
const getMarkdown = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('event:', event);
        console.log('event.pathParameters:', event.pathParameters);
        console.log('event.pathParameters.filePath:', event.pathParameters.filePath);
        const { filePath } = event.pathParameters;
        const key = `pages/${filePath}.md`;
        if (!BUCKET_NAME) {
            throw new Error('S3_BUCKET_NAME is not defined');
        }
        const response = yield s3
            .getObject({ Bucket: BUCKET_NAME, Key: key })
            .promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ content: response.Body ? response.Body.toString("utf-8") : "" }),
        };
    }
    catch (error) {
        console.error(error);
        return { statusCode: 404, body: JSON.stringify({ error: "File not found" }) };
    }
});
exports.getMarkdown = getMarkdown;
const uploadMarkdown = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, content } = JSON.parse(event.body);
        const key = `pages/${fileName}.md`;
        if (!BUCKET_NAME) {
            throw new Error('S3_BUCKET_NAME is not defined');
        }
        yield s3
            .putObject({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: content,
            ContentType: "text/markdown",
        })
            .promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "File uploaded successfully", key }),
        };
    }
    catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
});
exports.uploadMarkdown = uploadMarkdown;
// Handler to create a new page
const createPage = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, slug, content } = JSON.parse(event.body || '{}');
    const fileName = `${slug}.md`; // Using the slug as the file name
    console.log('Title:', title);
    if (!BUCKET_NAME) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'S3_BUCKET_NAME is not defined' }),
        });
        return;
    }
    // Prepare the S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: content,
        ContentType: 'text/markdown',
    };
    try {
        // Upload the markdown content to the S3 bucket
        yield s3.putObject(params).promise();
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({ message: 'Page created successfully' }),
        });
    }
    catch (error) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating page', error }),
        });
    }
});
exports.createPage = createPage;
// src/handler.ts
const getPage = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const slug = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.slug;
    const fileName = `${slug}.md`; // Use the slug as the file name
    // S3 parameters to fetch the file
    if (!BUCKET_NAME) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'S3_BUCKET_NAME is not defined' }),
        });
        return;
    }
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
    };
    try {
        // Get the markdown file from S3
        const data = yield s3.getObject(params).promise();
        const content = ((_b = data.Body) === null || _b === void 0 ? void 0 : _b.toString('utf-8')) || '';
        callback(null, {
            statusCode: 200,
            body: JSON.stringify({ title: slug, content }), // You could include a title or other metadata here if needed
        });
    }
    catch (error) {
        console.error(error);
        callback(null, {
            statusCode: 404,
            body: JSON.stringify({ message: 'Page not found' }),
        });
    }
});
exports.getPage = getPage;


/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/handler.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=handler.js.map