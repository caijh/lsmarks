"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UsernameFormProps {
  currentUsername: string;
  onSuccess: (newUsername: string) => void;
}

export function UsernameForm({ currentUsername, onSuccess }: UsernameFormProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证用户名
    if (!username || username.trim() === "") {
      setError("用户名不能为空");
      return;
    }

    if (username === currentUsername) {
      setOpen(false);
      return;
    }

    // 用户名格式验证
    const usernameRegex = /^[a-z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setError("用户名只能包含小写字母、数字、下划线和连字符，长度为3-20个字符");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/user/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "修改用户名失败");
      }

      // 成功处理
      toast.success("用户名已更新", {
        description: `您的用户名已成功更新为 ${username}`,
        duration: 3000,
      });

      onSuccess(username);
      setOpen(false);
    } catch (error) {
      console.error("Error updating username:", error);
      setError(error instanceof Error ? error.message : "修改用户名失败，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full p-1 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
          title="修改用户名"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span className="sr-only">修改用户名</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>修改用户名</DialogTitle>
          <DialogDescription>
            用户名是您的唯一标识，用于生成您的个人链接。修改后，您的个人链接也会随之改变。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="col-span-3"
                placeholder="请输入新的用户名"
                autoComplete="off"
              />
            </div>
            {error && (
              <div className="text-sm text-destructive col-span-4 text-center">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
