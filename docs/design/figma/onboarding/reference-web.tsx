/**
 * Reference export from Figma MCP (get_design_context).
 * Node: 11993:576 — Onboarding
 * DO NOT use as-is in production. Convert to React Native / project tokens.
 * Asset URLs expire ~7 days; use files in ./assets/ instead.
 */
const imgLogoSena1 = "./assets/logo-sena.png";
const imgCap = "./assets/status-bar-cap.png";
const imgWifi = "./assets/status-bar-wifi.png";
const imgCellularConnection = "./assets/status-bar-cellular.png";

export default function OnboardingReference() {
  return (
    <div className="bg-white relative size-full" data-node-id="11993:576" data-name="Onboarding">
      <div className="absolute inset-[95.81%_32%_0_32.27%]" data-node-id="11993:577" data-name="External-assets/Apple/Home-button">
        <div className="-translate-x-1/2 absolute bg-black bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[134px]" data-node-id="11993:578" data-name="Home Indicator" />
      </div>
      <div className="absolute h-[44px] left-0 right-0 top-0" data-node-id="11993:579" data-name="External-assets/Apple/Status-bar">
        <div className="absolute contents right-[12.34px] top-[17.33px]" data-node-id="11993:580" data-name="Battery">
          <div className="absolute border border-black border-solid h-[11.333px] opacity-35 right-[14.67px] rounded-[2.667px] top-[17.33px] w-[22px]" data-node-id="11993:581" data-name="Border" />
          <div className="absolute h-[4px] right-[12.34px] top-[21px] w-[1.328px]" data-node-id="11993:582" data-name="Cap">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCap} />
          </div>
          <div className="absolute bg-black h-[7.333px] right-[16.67px] rounded-[1.333px] top-[19.33px] w-[18px]" data-node-id="11993:583" data-name="Capacity" />
        </div>
        <div className="absolute h-[11px] right-[41.67px] top-[17.33px] w-[15.333px]" data-node-id="11993:584" data-name="Wifi">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgWifi} />
        </div>
        <div className="absolute h-[10.667px] right-[62px] top-[17.67px] w-[17px]" data-node-id="11993:588" data-name="Cellular Connection">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCellularConnection} />
        </div>
        <p className="-translate-x-1/2 absolute font-['SF_Pro_Text:Semibold'] leading-[normal] left-[47px] not-italic text-[15px] text-black text-center top-[calc(50%-7.67px)] tracking-[-0.3px] whitespace-nowrap" data-node-id="11993:593">
          9:41
        </p>
      </div>
      <a className="absolute content-stretch cursor-pointer flex flex-col items-start left-[25px] top-[621px]" data-node-id="11993:594" data-name="Primary / Default">
        <div className="bg-[#39a900] content-stretch flex flex-col items-center px-[32px] py-[19px] relative rounded-[32px] shrink-0 w-[327px]" data-node-id="I11993:594;160:0" data-name="Primary / Default">
          <p className="font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[15px] text-center text-white tracking-[0.105px] whitespace-nowrap" data-node-id="I11993:594;160:0;156:2394">
            Sign Up
          </p>
        </div>
      </a>
      <a className="absolute content-stretch cursor-pointer flex flex-col items-start left-[31px] top-[540px]" data-node-id="11993:595" data-name="Primary / Default">
        <div className="bg-[#04324d] content-stretch flex flex-col items-center px-[32px] py-[19px] relative rounded-[32px] shrink-0 w-[327px]" data-node-id="I11993:595;160:0" data-name="Primary / Default">
          <p className="font-['Inter:Bold'] font-bold leading-[normal] not-italic relative shrink-0 text-[15px] text-center text-white tracking-[0.105px] whitespace-nowrap" data-node-id="I11993:595;160:0;156:2394">
            Login
          </p>
        </div>
      </a>
      <div className="absolute h-[163px] left-[calc(20%+30px)] top-[224px] w-[178px]" data-node-id="11993:596" data-name="logoSena 1">
        <img alt="Logo SENA" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLogoSena1} />
      </div>
      <p className="-translate-x-1/2 absolute font-['Inter:Medium'] font-medium leading-[25px] left-[178px] not-italic text-[#2e3e5c] text-[15px] text-center top-[439px] tracking-[0.5px] w-[364px]" data-node-id="11993:597">
        Reporta incidencias, rastrea solicitudes y accede a soluciones en tiempo real.
      </p>
      <p className="-translate-x-1/2 absolute font-['Inter:Bold'] font-bold leading-[32px] left-[calc(20%+113px)] not-italic text-[#2e3e5c] text-[22px] text-center top-[368px] tracking-[0.5px] whitespace-nowrap" data-node-id="11993:598">
        Gestiona el soporte
        <br aria-hidden />
        técnico del CTPI
      </p>
      <p className="-translate-x-1/2 absolute font-['Inter:Bold'] font-bold leading-[32px] left-[calc(20%+57.5px)] not-italic text-[#04324d] text-[22px] text-center top-[192px] tracking-[0.5px] whitespace-nowrap" data-node-id="12000:547">
        MI
      </p>
      <p className="-translate-x-1/2 absolute font-['Inter:Bold'] font-bold leading-[32px] left-[calc(40%+36.5px)] not-italic text-[#39a900] text-[22px] text-center top-[192px] tracking-[0.5px] whitespace-nowrap" data-node-id="12000:549">
        AYUDA
      </p>
      <p className="-translate-x-1/2 absolute font-['Inter:Bold'] font-bold leading-[32px] left-[calc(60%+25px)] not-italic text-[#04324d] text-[22px] text-center top-[192px] tracking-[0.5px] whitespace-nowrap" data-node-id="12000:552">
        TICS
      </p>
    </div>
  );
}
