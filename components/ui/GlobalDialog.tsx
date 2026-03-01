"use client";

import {
    AlertDialog,
    AlertDialogAction,
    //   AlertDialogCancel, // Can enable if we want a cancel button, but for simple alerts usually just OK is needed.
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppContext } from "@/hooks/useAppContext";

export function GlobalDialog() {
    const { dialogConfig, closeDialog } = useAppContext();

    return (
        <AlertDialog open={dialogConfig.isOpen} onOpenChange={(open) => !open && closeDialog()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{dialogConfig.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {dialogConfig.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={closeDialog}>OK</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
