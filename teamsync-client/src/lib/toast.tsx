import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-[#6BCB77] text-black font-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 text-sm tracking-wide`}
      >
        <span>SUCCESS: {message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="border-2 border-black bg-white px-2 py-0.5 text-xs font-bold uppercase active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          ✕
        </button>
      </div>
    ));
  },

  error: (message: string) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-[#FF6B6B] text-white font-black border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 text-sm tracking-wide`}
      >
        <span>ERROR: {message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="border-2 border-black bg-black text-white px-2 py-0.5 text-xs font-bold uppercase active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          ✕
        </button>
      </div>
    ));
  },
};