"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export function LogoutButton({ locale = 'zh' }: { locale?: string }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error("退出登录时出错:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-full"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <div className="flex items-center justify-center w-full">
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              {locale === 'zh' ? '正在退出...' : 'Logging out...'}
            </div>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              {locale === 'zh' ? '退出登录' : 'Logout'}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{locale === 'zh' ? '确认退出登录？' : 'Confirm Logout?'}</AlertDialogTitle>
          <AlertDialogDescription>
            {locale === 'zh'
              ? '您确定要退出登录吗？退出后需要重新登录才能访问您的账户。'
              : 'Are you sure you want to log out? You will need to log in again to access your account.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{locale === 'zh' ? '取消' : 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout}>
            {locale === 'zh' ? '确认退出' : 'Confirm Logout'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
