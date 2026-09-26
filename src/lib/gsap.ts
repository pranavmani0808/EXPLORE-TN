import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { CustomEase } from "gsap/CustomEase";
import { RoughEase, ExpoScaleEase, SlowMo } from "gsap/EasePack";

import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Observer } from "gsap/Observer";
import { PixiPlugin } from "gsap/PixiPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { TextPlugin } from "gsap/TextPlugin";

// Register all standard GSAP core plugins and react hook
if (typeof window !== "undefined") {
  gsap.registerPlugin(
    useGSAP,
    Draggable,
    Flip,
    MotionPathPlugin,
    Observer,
    PixiPlugin,
    ScrollTrigger,
    ScrollToPlugin,
    TextPlugin,
    RoughEase,
    ExpoScaleEase,
    SlowMo,
    CustomEase
  );
}

export {
  gsap,
  useGSAP,
  Draggable,
  Flip,
  MotionPathPlugin,
  Observer,
  PixiPlugin,
  ScrollTrigger,
  ScrollToPlugin,
  TextPlugin,
  RoughEase,
  ExpoScaleEase,
  SlowMo,
  CustomEase,
};
