import PathGroup from "./PathGroup";

export default function genResourcePathGroup (p: string | string[]) {
  return new PathGroup(p)
}
