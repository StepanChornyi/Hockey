import { CanvasDriver, StageScaleMode, MasterAudio,Input } from "black-engine";
// import { InputMultiPointer as Input } from "./Fix/InputMultiPointerFix";
import { EngineFix as Engine } from "./Fix/EngineFix";
import "./Fix/graphicsRadialGradientFix";

import Game from "./Game";

const engine = new Engine('container', Game, CanvasDriver, [Input, MasterAudio]);

engine.viewport.nativeElement.style.display = "block";

engine.pauseOnBlur = false;
engine.pauseOnHide = false;
engine.viewport.isTransparent = true;
engine.viewport.backgroundColor = 0x181818;
engine.start();
engine.stage.setSize(640, 960);
engine.stage.scaleMode = StageScaleMode.LETTERBOX;

engine.start();

engine.stage.setSize(640, 960);
engine.stage.scaleMode = StageScaleMode.LETTERBOX;