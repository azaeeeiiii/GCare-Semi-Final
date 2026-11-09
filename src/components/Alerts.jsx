import { Link } from 'react-router-dom';
import { ArrowRight, btn, useDialog } from './ui';

/* The red alert banner on the landing page + its details pop-up */


/* Red "ACTIVE ALERTS" pill at the top of the hero */
export function AlertBanner({ alert, onViewDetails }) {
  // every direct child sits above the cloud image
  const child = 'relative z-[1]';

  return (
    <section
      aria-label="Active alerts"
      className="relative z-[1] mx-1 flex min-h-[46px] items-center gap-3.5 overflow-hidden rounded-full bg-danger pl-5 pr-3 shadow-[0_2px_6px_rgba(0,0,0,.25)] mob:col-span-2
        max-[960px]:flex-wrap max-[960px]:gap-y-2.5 max-[960px]:rounded-[28px] max-[960px]:px-4 max-[960px]:py-3
        max-[760px]:mx-0 max-[760px]:gap-x-3 max-[760px]:rounded-[22px] max-[760px]:py-3.5"
    >
      <img
        src="/images/warning_icon.png"
        alt=""
        aria-hidden="true"
        className={`${child} block size-[30px] flex-none object-contain max-[760px]:size-[26px]`}
      />

      <span className={`${child} h-[26px] w-0.5 flex-none bg-white/90 max-[760px]:h-[22px]`} aria-hidden="true" />

      <strong className={`${child} whitespace-nowrap text-[15px] font-extrabold tracking-[.3px] max-[760px]:text-sm max-[380px]:text-[13px]`}>
        ACTIVE ALERTS
      </strong>

      <span className={`${child} inline-block flex-none rounded-full bg-white px-4 py-[5px] text-[13px] font-bold text-danger max-[760px]:ml-auto max-[380px]:px-3 max-[380px]:py-1`}>
        {alert.level}
      </span>

      <p className={`${child} m-0 min-w-0 flex-1 text-[12.5px] leading-tight max-[960px]:order-5 max-[960px]:basis-full max-[760px]:text-[13px] max-[760px]:leading-[1.35]`}>
        <strong>{alert.headline}</strong> - <span>{alert.area}</span>
        <br />
        <span>Issued: {alert.issued}</span>
      </p>

      <img
        src="/images/clouds.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[190px] z-0 block h-[46px] w-auto max-w-[180px] object-contain object-bottom max-[960px]:hidden"
      />

      <button
        type="button"
        onClick={onViewDetails}
        className={btn(
          'outlineLight',
          `${child} ml-auto !px-3.5 !py-[7px] !text-[13px] max-[960px]:order-6 max-[960px]:ml-0 max-[760px]:flex-[1_1_100%] max-[760px]:justify-center max-[760px]:!py-2.5`
        )}
      >
        View Details
        <ArrowRight />
      </button>
    </section>
  );
}


export function AlertModal({ open, onClose, alert }) {
  const { ref, onMouseDown, onClick } = useDialog(open, onClose);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onClick={onClick}
      aria-labelledby="modalTitle"
      className="m-auto w-[min(560px,calc(100%-32px))] rounded-[18px] border-0 p-7 text-navy shadow-[0_20px_60px_rgba(0,0,0,.4)] backdrop:bg-[rgba(10,15,28,.6)] open:animate-pop motion-reduce:animate-none"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3.5 top-2.5 size-[34px] cursor-pointer border-0 bg-transparent text-[28px] leading-none text-navy"
      >
        &times;
      </button>

      <span className="inline-block flex-none rounded-full bg-danger px-4 py-[5px] text-[13px] font-bold text-white">
        {alert.level}
      </span>

      <h3 id="modalTitle" className="mb-1 mt-3 text-[26px] font-bold">
        {alert.headline}
      </h3>
      <p className="mb-3.5 text-[13px] text-muted">
        {alert.area} &bull; Issued: {alert.issued}
      </p>

      <div className="max-h-[40vh] overflow-auto text-[15px] leading-normal">
        {alert.body.map((text, i) => (
          <p key={i} className="mb-2.5">{text}</p>
        ))}
      </div>

      <div className="mt-5 flex gap-2.5">
        <Link to="/news#alerts" className={btn('navy')}>See all alerts</Link>
        <button type="button" className={btn('outlineDark')} onClick={onClose}>Close</button>
      </div>
    </dialog>
  );
}
