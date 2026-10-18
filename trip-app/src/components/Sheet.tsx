import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { D } from "../data";
import { P } from "../model";
import { useMedia, useUI, type SheetReq } from "../ui";
import { Icon } from "./Icon";
import { AddonPrice, Settings, ShareUrl } from "./Library";
import { PlaceSheet } from "./Places";

function titleOf(r: SheetReq) {
  switch (r.kind) {
    case "place":
      return P(r.id).name;
    case "addon":
      return D.addons[r.id].title;
    case "settings":
      return "People and exchange rate";
    case "share":
      return "Share this route";
  }
}

export function Sheet() {
  const { sheet, close } = useUI();
  const narrow = useMedia("(max-width: 719px)");
  const reduce = useReducedMotion();
  const variant = narrow ? "bottom" : "side";
  const off = reduce ? { opacity: 0 } : variant === "side" ? { x: "100%" } : { y: "100%" };
  const on = reduce ? { opacity: 1 } : variant === "side" ? { x: 0 } : { y: 0 };

  return (
    <Dialog.Root open={!!sheet} onOpenChange={(o) => !o && close()}>
      <AnimatePresence>
        {sheet && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                key={variant}
                className={"sheet sheet-" + variant + (sheet.kind === "place" ? " sheet-place" : "")}
                initial={off}
                animate={on}
                exit={off}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 40 }}
              >
                <div className="sheet-head">
                  <Dialog.Title className={sheet.kind === "place" ? "sr-only" : "sheet-heading"}>{titleOf(sheet)}</Dialog.Title>
                  <Dialog.Close className="icon-btn sheet-close" aria-label="Close">
                    <Icon name="x" />
                  </Dialog.Close>
                </div>
                <SheetContent r={sheet} />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function SheetContent({ r }: { r: SheetReq }) {
  switch (r.kind) {
    case "place":
      return <PlaceSheet key={r.id} id={r.id} />;
    case "addon":
      return <AddonPrice id={r.id} />;
    case "settings":
      return <Settings />;
    case "share":
      return <ShareUrl url={r.url} />;
  }
}
