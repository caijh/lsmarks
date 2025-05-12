"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Calendar, Star, RefreshCw } from "lucide-react";
import { UserLevelBadge } from "@/components/user/user-level-badge";
import { UserLevelEnum, getUserLevelInfo } from "@/types/user/level";
import { UsernameForm } from "./username-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserProfile {
  uuid: string;
  email: string;
  nickname: string;
  username: string;
  avatar_url?: string;
  user_level: number | string;
  created_at: string;
}

export function UserInfoCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixingIcons, setIsFixingIcons] = useState(false);

  // 添加一个刷新标记，用于强制重新获取用户信息
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 添加一个刷新函数，可以在需要时调用
  const refreshUserInfo = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 修复图标URL的函数
  const fixIconUrls = async () => {
    try {
      setIsFixingIcons(true);

      const response = await fetch('/api/bookmark/fix-icons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`成功修复了 ${result.updated} 个图标URL`);
      } else {
        const error = await response.json();
        toast.error(`修复图标失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('修复图标时出错:', error);
      toast.error('修复图标时出错，请稍后再试');
    } finally {
      setIsFixingIcons(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        // 使用新的API路由获取最新的用户信息
        const timestamp = new Date().getTime();
        const profileResponse = await fetch(`/api/user/profile?_=${timestamp}`, {
          // 添加缓存控制头，确保获取最新数据
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          console.log("Fetched user profile from API:", userData);

          if (userData) {
            const userProfile = {
              uuid: userData.uuid,
              email: userData.email,
              nickname: userData.nickname || userData.email.split('@')[0],
              username: userData.username || userData.nickname || userData.email.split('@')[0],
              avatar_url: userData.avatar_url,
              user_level: userData.user_level || "1",
              created_at: userData.created_at || new Date().toISOString()
            };

            setProfile(userProfile);
          }
        } else {
          // 如果新API失败，回退到旧方法
          console.warn("Failed to fetch from new API, falling back to session API");
          const sessionResponse = await fetch(`/api/auth/session?_=${timestamp}`, {
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();

            if (sessionData && sessionData.user) {
              console.log("Fetched user profile from session:", sessionData.user);

              const sessionProfile = {
                uuid: sessionData.user.uuid || sessionData.user.id,
                email: sessionData.user.email,
                nickname: sessionData.user.nickname || sessionData.user.name || sessionData.user.email.split('@')[0],
                username: sessionData.user.username || sessionData.user.nickname || sessionData.user.email.split('@')[0],
                avatar_url: sessionData.user.avatar_url || sessionData.user.image,
                user_level: sessionData.user.user_level || "1",
                created_at: sessionData.user.created_at || new Date().toISOString()
              };

              setProfile(sessionProfile);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    // 每次 refreshTrigger 变化时重新获取用户信息
  }, [refreshTrigger]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // 将用户等级转换为枚举类型
  const getUserLevelEnum = (level: number | string | undefined): UserLevelEnum => {
    console.log(`Converting user level: ${level} (type: ${typeof level})`);

    // 如果是 undefined，返回默认等级
    if (level === undefined) {
      console.log("Level is undefined, defaulting to LEVEL_1");
      return UserLevelEnum.LEVEL_1;
    }

    // 如果是字符串，尝试转换为数字
    let numLevel: number;
    if (typeof level === 'string') {
      numLevel = parseInt(level, 10) || 1;
      console.log(`Parsed string level "${level}" to number: ${numLevel}`);
    } else if (typeof level === 'number') {
      numLevel = level || 1;
      console.log(`Using number level: ${numLevel}`);
    } else {
      console.log(`Unknown level type: ${typeof level}, defaulting to LEVEL_1`);
      return UserLevelEnum.LEVEL_1;
    }

    // 确保用户等级在有效范围内
    if (numLevel >= 1 && numLevel <= 6) {
      console.log(`Level ${numLevel} is valid, returning as UserLevelEnum`);
      return numLevel as UserLevelEnum;
    }

    // 默认返回初级用户
    console.log(`Invalid user level: ${level}, defaulting to LEVEL_1`);
    return UserLevelEnum.LEVEL_1;
  };

  // 获取用户等级信息
  const levelInfo = profile ? (() => {
    console.log("Profile user_level:", profile.user_level, typeof profile.user_level);
    const levelEnum = getUserLevelEnum(profile.user_level);
    console.log("Converted to UserLevelEnum:", levelEnum);
    const info = getUserLevelInfo(levelEnum);
    console.log("Level info:", info);
    return info;
  })() : null;

  // 获取用户头像的首字母
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container px-3 sm:px-4 md:px-6 mb-3 pt-4 sm:pt-5">
        <Card>
          <div className="p-2.5 sm:p-3">
            {/* 顶部：头像和用户名 */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-9 w-9 sm:h-11 sm:w-11 rounded-full" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-40 mt-0.5" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>

            {/* 底部：用户信息 */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/20 pt-1.5 mt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48 ml-auto hidden sm:block" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container px-3 sm:px-4 md:px-6 mb-3 pt-4 sm:pt-5">
      <Card className="overflow-hidden relative border-border/60 bg-card/65 backdrop-blur-sm shadow-sm">
        {/* 卡片内主题渐变背景 */}
        <div className="absolute inset-0 bg-gradient-primary-subtle opacity-50 -z-10"></div>
        <div className="absolute inset-0 bg-gradient-primary-radial opacity-30 -z-10"></div>

        <div className="p-2.5 sm:p-3">
          {/* 顶部：头像和用户名 */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border border-primary/20 shadow-sm">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(profile.nickname || profile.username || profile.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                  <span className="mr-0.5">{profile.nickname || profile.username}</span>
                  <UserLevelBadge
                    level={getUserLevelEnum(profile.user_level)}
                    size="sm"
                    showDescription={false}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {profile.email}
                </div>
              </div>
            </div>

            {/* 用户操作按钮已移至用户名旁边 */}
          </div>

          {/* 用户等级描述 */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 border-t border-border/20 pt-1.5">
            <Star className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
            <span className="font-medium">等级: </span>
            <span>
              {levelInfo && `${levelInfo.name}：${levelInfo.description}（最大集合数：${levelInfo.maxCollections === 999 ? "无限" : levelInfo.maxCollections}，最大书签数：${levelInfo.maxBookmarks === 999999 ? "无限" : levelInfo.maxBookmarks.toLocaleString()}）`}
            </span>
          </div>

          {/* 底部：用户信息 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-t border-border/20 pt-1.5 mt-1.5">
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
              <span className="font-medium">用户名: </span>
              <code className="bg-primary/5 px-1.5 py-0.5 rounded text-foreground font-medium">
                {profile.username}
              </code>
              <UsernameForm
                currentUsername={profile.username}
                onSuccess={(newUsername) => {
                  // 更新本地状态
                  setProfile(prev => prev ? { ...prev, username: newUsername } : null);

                  // 触发刷新用户信息
                  refreshUserInfo();
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
              <span>
                注册于: {formatDate(profile.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <div className="text-xs opacity-70 hidden sm:block">
                用户名是您的唯一标识，用于生成您的个人链接
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs ml-auto"
                onClick={fixIconUrls}
                disabled={isFixingIcons}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isFixingIcons ? 'animate-spin' : ''}`} />
                修复图标
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
