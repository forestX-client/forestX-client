#!/usr/bin/env python3
"""Patch ForestX features INTO the client's own HTML shell.

This does NOT add a separate launcher/overlay. It edits, in place:
  * the client's own boot screen (#lx-boot — same element, same progress
    JavaScript) restyled into the tranquil forest + username-on-the-hill
  * the client's own ForestX F8 panel: a new "▶ Play" tab with username,
    UNO / DOS / Settings buttons and saved multiplayer servers

Everything before <body> (the entire game: WASM, assets, shell loader)
is asserted byte-identical after patching. Pristine file is recoverable
by re-running the fetch workflow / `git show 95207d1:forestx.html`.

Usage: python3 tools/patch_client.py [INPUT] [OUTPUT]   (default in-place)
"""
import hashlib
import sys

MARKER = "FXPATCH1"

NEW_CSS = r"""#loading_screen{display:none!important}
/*FXPATCH1 — the client's own #lx-boot, restyled as the forest*/
#lx-boot{position:fixed;inset:0;z-index:2147483646;color:#eef7ec;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transition:opacity .6s ease;overflow:hidden;font-family:"Segoe UI",system-ui,sans-serif;padding:16px;text-align:center;background:linear-gradient(180deg,#f7b267 0%,#fad6a0 22%,#a8d5a2 48%,#4e9455 72%,#1d4d28 100%)}
#lx-boot.off{opacity:0;pointer-events:none}
.bt-scene{position:absolute;inset:0;pointer-events:none}
.bt-scene svg{width:100%;height:100%;display:block}
.bt-cloud{animation:btdrift 55s linear infinite alternate}
@keyframes btdrift{from{transform:translateX(-36px)}to{transform:translateX(46px)}}
.bt-fog{animation:btfog 13s ease-in-out infinite alternate}
@keyframes btfog{from{transform:translateX(-26px);opacity:.45}to{transform:translateX(34px);opacity:.8}}
.bt-sway{transform-box:fill-box;transform-origin:50% 100%;animation:btsway 5.5s ease-in-out infinite}
@keyframes btsway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1.1deg)}}
#lx-boot::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(115% 85% at 50% 40%,transparent 52%,rgba(3,12,5,.5) 100%)}
.bt-inner{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px;max-width:94vw;max-height:96vh;overflow:auto;padding:6px}
.bt-logo{position:relative;display:grid;grid-template-columns:repeat(4,22px);gap:4px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.45))}
.bt-logo i{width:22px;height:22px;border:2px solid rgba(0,0,0,.55);background:#2f9e44;animation:lxp 1.6s ease-in-out infinite}
.bt-logo i:nth-child(3n){background:#6abe30}.bt-logo i:nth-child(4n){background:#1f6f30}.bt-logo i:nth-child(-n+4){background:#7be382}
.bt-logo i:nth-child(2){animation-delay:.1s}.bt-logo i:nth-child(5){animation-delay:.25s}.bt-logo i:nth-child(7){animation-delay:.4s}.bt-logo i:nth-child(10){animation-delay:.55s}
@keyframes lxp{0%,100%{transform:scale(.55);opacity:.55}50%{transform:scale(1);opacity:1}}
.bt-kicker{font-size:11px;font-weight:700;letter-spacing:.4em;text-transform:uppercase;color:#20401f;text-shadow:0 1px 0 #ffffff88;margin-bottom:-6px}
.bt-title{position:relative;font:900 clamp(40px,8vw,64px)/1 "Arial Black","Segoe UI",system-ui,sans-serif;letter-spacing:.04em;color:#f7fff4;text-shadow:0 4px 0 #57a047,0 8px 0 #2c6423,0 12px 0 #173d10,0 20px 36px rgba(0,0,0,.5)}
.bt-title span{color:#59d95e}
.bt-sub{position:relative;font-size:12px;font-weight:700;color:#eaf7ec;letter-spacing:.55em;padding-left:.55em;text-transform:uppercase;margin-top:-4px;text-shadow:0 2px 8px #000b}
.bt-card{background:linear-gradient(180deg,rgba(9,26,14,.82),rgba(6,17,10,.88));border:1px solid rgba(255,255,255,.25);border-radius:18px;box-shadow:0 26px 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.16);backdrop-filter:blur(10px);padding:20px 22px;width:min(460px,92vw);margin-top:8px}
.bt-track{position:relative;width:100%;height:18px;border:3px solid #06130a;background:#223522;box-shadow:inset 0 0 0 2px #ffffff26;overflow:hidden}
.bt-fill{height:100%;width:0;background:repeating-linear-gradient(45deg,#68d84b 0 12px,#46a81f 12px 24px);box-shadow:inset 0 3px 0 #b8f29a,inset 0 -4px 0 #256b0f;transition:width .25s ease}
.bt-pct{position:relative;font:700 15px ui-monospace,Consolas,monospace;color:#7be382;margin-top:10px}
.bt-msg{position:relative;font-size:14px;color:#e2f2e4;min-height:19px;max-width:min(520px,90vw);margin-top:2px}
.bt-tip{position:relative;font-size:12.5px;color:#9fc3a5;margin-top:8px}
.bt-btn{position:relative;display:none;padding:9px 18px;border:2px solid #06130a;background:linear-gradient(180deg,#a6a6a6,#6f6f6f);color:#fff;cursor:pointer;font-size:13px;font-weight:700;box-shadow:inset 0 3px 0 #d2d2d2,inset 0 -4px 0 #3d3d3d;margin-top:10px}
.bt-user{margin-top:16px;border-top:1px dashed rgba(255,255,255,.22);padding-top:15px;text-align:left}
.bt-user label{display:block;font-weight:800;font-size:14.5px;margin-bottom:8px;color:#eef7ec}
#fx-name{width:100%;box-sizing:border-box;background:#08160acc;border:2px solid #ffffff38;border-bottom:4px solid #000;color:#fff;font:700 17px "Segoe UI",system-ui,sans-serif;padding:11px 13px;border-radius:9px;outline:none}
#fx-name:focus{border-color:#7be382;box-shadow:0 0 0 3px #59c93c4d}
.bt-namehint{font-size:12px;color:#9fc3a5;margin-top:7px;min-height:16px}
#fx-body .fx-big{font-weight:900;font-size:15.5px;color:#fff!important;background:linear-gradient(180deg,#74d84f,#46a81f 55%,#378a17)!important;text-shadow:1px 2px 0 #1d4d0c;border:2px solid #06130a!important;box-shadow:inset 0 3px 0 #a6ec8a,inset 0 -4px 0 #256b0f;padding:13px 14px!important;border-radius:4px!important}
#fx-body .fx-big.stone{background:linear-gradient(180deg,#a6a6a6,#747474 55%,#5a5a5a)!important;text-shadow:1px 2px 0 #2b2b2b;box-shadow:inset 0 3px 0 #d2d2d2,inset 0 -4px 0 #3d3d3d}
@media (prefers-reduced-motion:reduce){#lx-boot *,#lx-boot *::before,#lx-boot *::after{animation:none!important;transition:none!important}}"""

NEW_BOOT_HTML = r"""<div id="lx-boot">
 <div class="bt-scene" aria-hidden="true">
  <svg viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid slice" focusable="false">
   <defs>
    <filter id="bt-soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
    <symbol id="bt-pine" viewBox="0 0 100 190"><rect x="45" y="150" width="10" height="36" fill="#5d4030"/><polygon points="50,4 84,74 16,74" fill="currentColor"/><polygon points="50,44 92,122 8,122" fill="currentColor"/><polygon points="50,88 99,168 1,168" fill="currentColor"/></symbol>
    <symbol id="bt-oak" viewBox="0 0 160 190"><path d="M74 190 L78 108 L62 78 M80 122 L104 88 M79 136 L52 108" stroke="#5d4030" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="52" cy="70" r="34" fill="currentColor"/><circle cx="88" cy="48" r="42" fill="currentColor"/><circle cx="118" cy="78" r="32" fill="currentColor"/><circle cx="76" cy="84" r="38" fill="currentColor"/></symbol>
    <symbol id="bt-cloud" viewBox="0 0 260 90"><ellipse cx="72" cy="58" rx="58" ry="24" fill="#fff"/><ellipse cx="128" cy="42" rx="62" ry="30" fill="#fff"/><ellipse cx="188" cy="58" rx="56" ry="22" fill="#fff"/><rect x="24" y="52" width="214" height="24" rx="12" fill="#fff"/></symbol>
   </defs>
   <circle cx="1120" cy="148" r="66" fill="#fff3b0"/><circle cx="1120" cy="148" r="112" fill="#ffdf8a" opacity=".35" filter="url(#bt-soft)"/>
   <g opacity=".9"><use href="#bt-cloud" class="bt-cloud" x="70" y="54" width="280" opacity=".85"/><use href="#bt-cloud" class="bt-cloud" x="790" y="30" width="220" opacity=".6" style="animation-duration:68s"/><use href="#bt-cloud" class="bt-cloud" x="1140" y="104" width="240" opacity=".5" style="animation-duration:62s"/></g>
   <path d="M0 430 L180 300 L330 392 L520 268 L720 390 L900 282 L1090 398 L1250 316 L1440 414 L1440 810 L0 810Z" fill="#35684a" opacity=".7"/>
   <path d="M0 504 L120 440 L260 497 L430 422 L610 501 L790 430 L970 503 L1130 440 L1300 501 L1440 450 L1440 810 L0 810Z" fill="#275c36"/>
   <g color="#1e4d2a"><use href="#bt-pine" x="30" y="392" width="92"/><use href="#bt-pine" x="150" y="350" width="120"/><use href="#bt-pine" x="330" y="384" width="100"/><use href="#bt-pine" x="540" y="348" width="128"/><use href="#bt-pine" x="760" y="390" width="98"/><use href="#bt-pine" x="930" y="344" width="126"/><use href="#bt-pine" x="1160" y="388" width="102"/><use href="#bt-pine" x="1310" y="352" width="118"/></g>
   <g class="bt-fog" fill="#fff" filter="url(#bt-soft)"><ellipse cx="300" cy="552" rx="330" ry="32"/><ellipse cx="1050" cy="528" rx="380" ry="28"/></g>
   <path d="M-40 810 C180 612 430 562 720 602 C1010 642 1260 612 1490 722 L1490 810Z" fill="#3f9142"/>
   <path d="M-40 810 C220 662 520 628 790 666 C1060 704 1280 682 1490 772 L1490 810Z" fill="#2e7d32"/>
   <path d="M618 810 C660 742 716 712 700 664 C690 634 736 618 772 606" stroke="#c9b18a" stroke-width="24" fill="none" stroke-linecap="round" opacity=".8"/>
   <g color="#245c2c"><use href="#bt-oak" class="bt-sway" x="4" y="488" width="205"/><use href="#bt-oak" class="bt-sway" x="1212" y="474" width="232" style="animation-delay:-2s"/><use href="#bt-pine" x="1120" y="522" width="102"/><use href="#bt-pine" x="236" y="538" width="94"/></g>
   <g fill="#ffd54f"><circle cx="350" cy="716" r="5"/><circle cx="430" cy="742" r="4"/><circle cx="980" cy="724" r="5"/><circle cx="560" cy="700" r="4"/></g>
  </svg>
 </div>
 <div class="bt-inner">
  <div class="bt-logo"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
  <div class="bt-kicker">You are entering</div>
  <div class="bt-title">FOREST<span>X</span></div><div class="bt-sub">Client</div>
  <div class="bt-card">
   <div class="bt-track"><div class="bt-fill" id="bt-fill"></div></div>
   <div class="bt-pct" id="bt-pct">0%</div>
   <div class="bt-msg" id="bt-msg">Starting…</div>
   <button class="bt-btn" id="bt-reload" type="button">Reload</button>
   <div class="bt-tip" id="bt-tip"></div>
   <div class="bt-user">
    <label for="fx-name">⛰ Who's exploring today?</label>
    <input id="fx-name" type="text" maxlength="16" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Username">
    <div class="bt-namehint" id="fx-namehint">Type your username while the forest loads — saved on this device.</div>
   </div>
  </div>
 </div>
</div>"""

# --- JS: Play tab injected into the panel's own render() ---
PLAY_BRANCH = r"""  if(S.tab==="play"){
    /*FXPATCH1 — Play tab inside the client's own ForestX panel*/
    var fxGo=function(mode,sv){
      var nm=(($("fx-pname")||{}).value||S.name||"").trim();
      if(nm){S.name=nm;save()}
      var cp=null;try{cp=navigator.clipboard&&navigator.clipboard.writeText(sv?sv.a:(nm||""))}catch(e){}
      if(cp&&cp.catch)cp.catch(function(){});
      closePanel();
      if(sv)toast("🌐 "+sv.n+" — address copied. In the game: Multiplayer → Add Server → paste (Ctrl+V)");
      else if(mode==="multi")toast("🌐 Hit Multiplayer on the title screen. Your username is copied if it asks.");
      else toast("⛏ Hit Singleplayer on the title screen"+(nm?(", "+nm):"")+".");
    };
    b.appendChild(sec("Player"));
    var nmIn=el("input",{type:"text",id:"fx-pname",placeholder:"Username",class:"n",maxlength:"16",style:"flex:1"});
    nmIn.value=S.name||"";
    nmIn.oninput=function(){S.name=nmIn.value.trim().slice(0,16);save();var li=$("fx-name");if(li)li.value=S.name;};
    b.appendChild(el("div",{class:"row"},[el("span",{text:"Username"}),nmIn]));
    b.appendChild(el("div",{class:"hint",text:"Saved on this device (same name as the loading-screen hill). Copied for you when you head in — paste it if the game asks for a profile name."}));
    b.appendChild(sec("Play"));
    b.appendChild(el("button",{type:"button",class:"fx-big",text:"UNO · Singleplayer",on:{click:function(){fxGo("single")}}}));
    b.appendChild(el("button",{type:"button",class:"fx-big",text:"DOS · Multiplayer",on:{click:function(){fxGo("multi")}}}));
    b.appendChild(el("button",{type:"button",class:"fx-big stone",text:"⚙ Settings",on:{click:function(){S.tab="look";save();render()}}}));
    b.appendChild(el("div",{class:"hint",text:"These close the panel and hand you to the game's own title screen — pick Singleplayer / Multiplayer there. The game draws its menu on canvas, so no web page can press those for you."}));
    b.appendChild(sec("Servers — DOS"));
    b.appendChild(el("div",{class:"row"},[el("input",{type:"text",id:"fx-svn",placeholder:"name",class:"n",style:"width:92px"}),el("input",{type:"text",id:"fx-sva",placeholder:"wss://…",class:"n",style:"flex:1;min-width:110px"})]));
    b.appendChild(btn("Save server",function(){
      var n=($("fx-svn").value||"").trim(),a=($("fx-sva").value||"").trim(),h=$("fx-svh");
      if(!/^wss:\/\/.+/.test(a)){if(h)h.textContent="Address must start with wss://";return}
      S.servers.push({n:n||a.replace(/^wss:\/\//,""),a:a});save();render();toast("Server saved. Hit Join when ready.");
    }));
    b.appendChild(el("div",{class:"hint",id:"fx-svh"}));
    S.servers.forEach(function(sv,idx){
      b.appendChild(el("div",{class:"wp"},[el("span",{text:sv.n+"  "+sv.a}),
        el("span",{},[btn("Join →",function(){fxGo("multi",sv)}),btn("✕",function(){S.servers.splice(idx,1);save();render()})])]));
    });
  }else if(S.tab==="look"){"""

BOOT_NAME_WIRING = r"""/*FXPATCH1 — username field on the client's own loading screen*/
var fxNameEl=$("fx-name"),fxNameHint=$("fx-namehint");
function fxNameSync(){
  if(!fxNameEl)return;
  var v=fxNameEl.value.trim(),ok=(v===""||/^[A-Za-z0-9_]{3,16}$/.test(v));
  if(ok){S.name=v;save()}
  if(fxNameHint){
    fxNameHint.textContent=!ok?"3–16 characters: letters, numbers and _":v?("✓ Saved — see you in there, "+v):"Type your username while the forest loads — saved on this device.";
    fxNameHint.style.color=!ok?"#ffb3ac":v?"#7be382":"";
  }
}
if(fxNameEl){
  fxNameEl.value=S.name||"";
  fxNameEl.addEventListener("input",fxNameSync);
  ["keydown","keyup","keypress"].forEach(function(evName){fxNameEl.addEventListener(evName,function(e){e.stopPropagation();if(e.key==="Enter")fxNameEl.blur()},false)});
  fxNameSync();
}
"""

ORIG_COMPLETE = 'setTimeout(function(){boot.classList.add("off");setTimeout(function(){boot.style.display="none"},700)},350)'
NEW_COMPLETE = ('setTimeout(function(){boot.classList.add("off");'
                '/*FXPATCH1*/if(S.name){try{var fxcp=navigator.clipboard&&navigator.clipboard.writeText(S.name);'
                'if(fxcp&&fxcp.catch)fxcp.catch(function(){})}catch(e){}}'
                'setTimeout(function(){toast("🌲 Welcome"+(S.name?", "+S.name:"")+" — ForestX Client is ready. Esc, then F8 for the menu")},900);'
                'setTimeout(function(){boot.style.display="none"},700)},350)')

ORIG_MSGFOR = ('function msgFor(p){return p>=100?"Showtime.":p<12?"Waking the engine up…":p<40?'
               '"Unpacking blocks. Art takes time.":p<70?"Teaching creepers to hiss…":p<97?'
               '"Polishing the title screen…":"Almost. Hold your horses."}')
NEW_MSGFOR = ('function msgFor(p){return p>=100?"The forest is ready.":p<12?"Waking the forest…":p<40?'
              '"Unpacking blocks. Art takes time.":p<70?"Teaching creepers to hiss…":p<97?'
              '"Growing the title screen…":"Almost. Hold your horses."}')


def replace_once(html: str, old: str, new: str, label: str) -> str:
    n = html.count(old)
    if n != 1:
        raise SystemExit(f"Anchor for {label!r} found {n}x (expected 1) — aborting, file untouched")
    return html.replace(old, new)


def patch(html: str) -> str:
    if MARKER in html:
        print("Already patched (FXPATCH1 present) — nothing to do.")
        return html

    body_at = html.find("<body")
    if body_at == -1:
        raise SystemExit("No <body> found — aborting")
    prefix_hash = hashlib.sha256(html[:body_at].encode()).hexdigest()

    # 1) Boot-screen CSS (span between anchors inside the client's own <style>)
    start_anchor = "#loading_screen{display:none!important}"
    end_anchor = "\n#fx-tab{"
    if html.count(start_anchor) != 1 or html.count(end_anchor) != 1:
        raise SystemExit("Boot CSS anchors not unique — aborting")
    s = html.find(start_anchor)
    e = html.find(end_anchor, s)
    html = html[:s] + NEW_CSS + html[e:]

    # 2) Boot-screen HTML (the #lx-boot div only)
    i = html.find('<div id="lx-boot">')
    tip = html.find('<div class="bt-tip" id="bt-tip"></div>', i) if i >= 0 else -1
    if i == -1 or tip == -1:
        raise SystemExit("#lx-boot div not found — aborting")
    close = html.find("</div>", tip) + len("</div>")
    html = html[:i] + NEW_BOOT_HTML + html[close:]

    # 3) Settings store: add name + servers
    html = replace_once(
        html,
        'leave:true,wps:[],tab:"look"}',
        'leave:true,wps:[],tab:"look",name:"",servers:[]}',
        "settings defaults",
    )
    # 4) Allow the new tab
    html = replace_once(
        html,
        'if(["look","hud","tools"].indexOf(S.tab)<0)S.tab="look";',
        'if(["play","look","hud","tools"].indexOf(S.tab)<0)S.tab="look";',
        "tab validity",
    )
    # 5) Tab bar: Play first
    html = replace_once(
        html,
        '[["look","Look"],["hud","HUD"],["tools","Tools"]]',
        '[["play","▶ Play"],["look","Look"],["hud","HUD"],["tools","Tools"]]',
        "tabs array",
    )
    # 6) render(): Play branch
    html = replace_once(
        html,
        'body.innerHTML="";var b=body;\n  if(S.tab==="look"){',
        'body.innerHTML="";var b=body;\n' + PLAY_BRANCH,
        "render() Play branch",
    )
    # 7) Loading messages, ForestX flavour
    html = replace_once(html, ORIG_MSGFOR, NEW_MSGFOR, "msgFor")
    # 8) Username wiring on the loading screen
    html = replace_once(
        html,
        '$("bt-tip").textContent=pick(TIPS);\n',
        '$("bt-tip").textContent=pick(TIPS);\n' + BOOT_NAME_WIRING,
        "boot username wiring",
    )
    # 9) Boot completion: copy name + welcome toast
    html = replace_once(html, ORIG_COMPLETE, NEW_COMPLETE, "boot completion")

    if hashlib.sha256(html[:body_at].encode()).hexdigest() != prefix_hash:
        raise SystemExit("Prefix (the game itself) changed — aborting")
    if html.count('id="game_frame"') != 1 or html.count('id="lx-boot"') != 1:
        raise SystemExit("Post-patch sanity failed — aborting")
    return html


def main() -> None:
    inp = sys.argv[1] if len(sys.argv) > 1 else "forestx.html"
    out = sys.argv[2] if len(sys.argv) > 2 else inp
    raw = open(inp, "rb").read()
    result = patch(raw.decode("utf-8"))
    open(out, "wb").write(result.encode("utf-8"))
    print(f"Patched {out}: {len(raw):,} -> {len(result.encode('utf-8')):,} bytes "
          f"({len(result.encode('utf-8')) - len(raw):+,})")


if __name__ == "__main__":
    main()
