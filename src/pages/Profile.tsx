
import React, { useState, useEffect } from "react";
import { 
  User, LogOut, Settings, Edit, MessageSquare, 
  Heart, UserPlus, Moon, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [dreamCount, setDreamCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [publicDreams, setPublicDreams] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      
      fetchUserStats();
      fetchPublicDreams();
      fetchConversations();
    }
  }, [user, profile, navigate]);
  
  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      // Get dream count
      const { data: dreams, error: dreamsError } = await supabase
        .from("dream_entries")
        .select("count")
        .eq("user_id", user.id);
      
      if (!dreamsError) {
        setDreamCount(dreams[0]?.count || 0);
      }
      
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("following_id", user.id);
      
      if (!followersError) {
        setFollowersCount(followers || 0);
      }
      
      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("followers")
        .select("*", { count: "exact" })
        .eq("follower_id", user.id);
      
      if (!followingError) {
        setFollowingCount(following || 0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  
  const fetchPublicDreams = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setPublicDreams(data || []);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    }
  };
  
  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      // Get unique conversation partners
      const { data: sent, error: sentError } = await supabase
        .from("messages")
        .select("receiver_id")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
      
      const { data: received, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });
      
      if (sentError || receivedError) throw sentError || receivedError;
      
      // Combine and get unique user IDs
      const userIds = new Set([
        ...(sent || []).map((msg) => msg.receiver_id),
        ...(received || []).map((msg) => msg.sender_id)
      ]);
      
      if (userIds.size > 0) {
        // Get profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", Array.from(userIds));
        
        if (profilesError) throw profilesError;
        
        setConversations(profiles || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          username,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      toast.success("Profile updated successfully!");
      setIsEditProfileOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error updating profile");
    }
  };
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    
    try {
      // For now, we'll simulate the avatar upload
      // In a real implementation, you would upload to a storage bucket and get the URL
      setTimeout(() => {
        // Simulate a URL being returned
        const fakeUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}`;
        setAvatarUrl(fakeUrl);
        setIsUploading(false);
        toast.success("Avatar updated!");
      }, 1500);
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload avatar");
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  if (!user || !profile) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <Moon size={48} className="mx-auto animate-pulse text-dream-purple" />
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen dream-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-6 pt-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-dream-lavender">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-dream-purple/20 text-dream-purple">
                {profile.username ? profile.username[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-0 right-0 rounded-full bg-white shadow-md p-1 h-8 w-8"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <Edit size={14} />
            </Button>
          </div>
          
          <h1 className="text-xl font-bold mt-3">
            {profile.display_name || profile.username || "New Dreamer"}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.username || "username"}</p>
          
          {profile.bio && (
            <p className="text-sm text-center mt-2 max-w-md">{profile.bio}</p>
          )}
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="font-bold">{dreamCount}</p>
              <p className="text-xs text-muted-foreground">Dreams</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{followersCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMessagesOpen(true)}
              className="flex items-center gap-1 text-sm"
            >
              <MessageSquare size={14} /> Messages
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1 text-sm"
            >
              <Settings size={14} /> Settings
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dreams" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dreams">My Dreams</TabsTrigger>
            <TabsTrigger value="likes">Liked Dreams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dreams" className="mt-4">
            {publicDreams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {publicDreams.map((dream: any) => (
                  <Card key={dream.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-0">
                      {dream.generatedImage ? (
                        <img 
                          src={dream.generatedImage} 
                          alt={dream.title}
                          className="aspect-square object-cover w-full"
                        />
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-dream-purple/10">
                          <Moon size={32} className="text-dream-purple opacity-50" />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-sm font-semibold truncate">{dream.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="outline" className="text-xs">
                            {new Date(dream.created_at).toLocaleDateString()}
                          </Badge>
                          <div className="flex items-center text-muted-foreground">
                            <Heart size={12} className="mr-1" />
                            <span className="text-xs">{dream.like_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Moon size={32} className="mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No public dreams yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your dreams to the Lucid Repo to see them here
                </p>
                <Link to="/">
                  <Button variant="outline">Go to Journal</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes" className="mt-4">
            <div className="text-center py-12">
              <Heart size={32} className="mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No liked dreams yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore the Lucid Repo to discover and like dreams
              </p>
              <Link to="/lucidrepo">
                <Button variant="outline">Explore Dreams</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-dream-purple/20">
                  {username ? username[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-dream-purple">
                  <Camera size={16} />
                  <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
                </div>
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile}
              className="bg-gradient-to-r from-dream-lavender to-dream-purple"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="gradient-text">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">AI Credits</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dream Analysis</span>
                  <span>5/10 used</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-dream-purple h-full w-1/2" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Image Generation</span>
                  <span>3/10 used</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="bg-dream-purple h-full w-3/10" />
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Upgrade Subscription
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Account</h3>
              <Button 
                variant="destructive" 
                className="w-full flex items-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Messages Dialog */}
      <Dialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Messages</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map((conversation: any) => (
                  <div 
                    key={conversation.id} 
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar_url} />
                      <AvatarFallback className="bg-dream-purple/20">
                        {conversation.username ? conversation.username[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.display_name || conversation.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Tap to view conversation
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {/* Replace with actual time */}
                      Now
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto mb-2 text-muted-foreground h-8 w-8" />
                <h3 className="font-medium mb-1">No messages yet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with other dreamers to start chatting
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
