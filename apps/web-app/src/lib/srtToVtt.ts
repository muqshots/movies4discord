export function srtToVtt(data: string) {
  const srt = data.replace(/\r+/g, "").replace(/^\s+|\s+$/g, "");
  const cuelist = srt.split("\n\n");
  let result = "";
  if (cuelist.length > 0) {
    result += "WEBVTT\n\n";
    cuelist.forEach((caption) => {
      let cue = "";
      const s = caption.split(/\n/);
      while (s.length > 3) {
        for (let i = 3; i < s.length; i++) {
          s[2] += "\n" + s[i];
        }
        s.splice(3, s.length - 3);
      }
      let line = 0;
      if (!s[0]!.match(/\d+:\d+:\d+/) && s[1]!.match(/\d+:\d+:\d+/)) {
        cue += s[0]!.match(/\w+/) + "\n";
        line += 1;
      }
      if (s[line]!.match(/\d+:\d+:\d+/)) {
        const m = s[1]!.match(
          /(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/
        );
        if (m) {
          cue +=
            m[1] +
            ":" +
            m[2] +
            ":" +
            m[3] +
            "." +
            m[4] +
            " --> " +
            m[5] +
            ":" +
            m[6] +
            ":" +
            m[7] +
            "." +
            m[8] +
            "\n";
          line += 1;
        } else {
          return "";
        }
      } else {
        return "";
      }
      if (s[line]) {
        cue += s[line] + "\n\n";
      }
      result += cue;
    });
  }
  return result;
}
