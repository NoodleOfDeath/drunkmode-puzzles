"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuzzleCanvas = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const styled_components_1 = __importDefault(require("styled-components"));
const types_1 = require("./types");
const ZERO_LAYOUT = { height: 0, width: 0 };
const StyledMain = (0, styled_components_1.default)('main') `
  display: flex;
  flex-direction: column;
  min-height: ${({ height }) => height}px;
`;
const PuzzleCanvas = ({ puzzle: ChildComponent }) => {
    const [env, setEnv] = react_1.default.useState();
    const [layout, setLayout] = react_1.default.useState(ZERO_LAYOUT);
    react_1.default.useLayoutEffect(() => {
        const updateLayout = () => {
            setLayout((prev) => {
                if ((prev === null || prev === void 0 ? void 0 : prev.width) === window.innerWidth &&
                    (prev === null || prev === void 0 ? void 0 : prev.height) === window.innerHeight) {
                    return prev;
                }
                const newSize = {
                    height: window.innerHeight,
                    width: window.innerWidth,
                };
                return newSize;
            });
        };
        window.addEventListener('resize', updateLayout);
        updateLayout();
        return () => {
            window.removeEventListener('resize', updateLayout);
        };
    }, []);
    react_1.default.useEffect(() => {
        const env = new types_1.PuzzleEnv();
        setEnv(env);
    }, []);
    return ((0, jsx_runtime_1.jsx)(StyledMain, { height: layout.height, children: (0, jsx_runtime_1.jsx)(ChildComponent, { preview: env === null || env === void 0 ? void 0 : env.preview, config: env === null || env === void 0 ? void 0 : env.config, data: env === null || env === void 0 ? void 0 : env.data, startFresh: !!(env === null || env === void 0 ? void 0 : env.preview) || !(env === null || env === void 0 ? void 0 : env.data), onConfig: (data) => types_1.PuzzleMessage.onConfig(Object.assign(Object.assign({}, env === null || env === void 0 ? void 0 : env.config), data)), onProgress: (data) => types_1.PuzzleMessage.onProgress(data), onFailure: (data) => types_1.PuzzleMessage.onFailure(data), onSuccess: (data) => types_1.PuzzleMessage.onSuccess(data) }) }));
};
exports.PuzzleCanvas = PuzzleCanvas;
