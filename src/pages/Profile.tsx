import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  User, LogOut, Settings, Edit, MessageSquare, 
  Heart, UserPlus, Moon, Camera, Link as LinkIcon, Globe, Twitter, Instagram, Facebook
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

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [viewedProfile, setViewedProfile] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isSocialLinksOpen, setIsSocialLinksOpen] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    facebook: "",
    website: ""
  });
  
  const [dreamCount, setDreamCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [publicDreams, setPublicDreams] = useState<any[]>([]);
  const [likedDreams, setLikedDreams] = useState<any[]>([]);
  const [conversations, setConversations] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const profileToShow = isOwnProfile ? profile : viewedProfile;
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    // Determine if viewing own profile or someone else's
    if (userId && userId !== user.id) {
      setIsOwnProfile(false);
      fetchUserProfile(userId);
      checkIfFollowing(userId);
    } else {
      setIsOwnProfile(true);
      if (profile) {
        setDisplayName(profile.display_name || "");
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setAvatarUrl(profile.avatar_url || "");
        
        // Parse social links from profile
        if (profile.social_links) {
          setSocialLinks({
            twitter: profile.social_links.twitter || "",
            instagram: profile.social_links.instagram || "",
            facebook: profile.social_links.facebook || "",
            website: profile.social_links.website || ""
          });
        }
      }
    }
    
    fetchUserStats();
    fetchPublicDreams();
    fetchLikedDreams();
    
    if (isOwnProfile) {
      fetchConversations();
    }
  }, [user, profile, userId]);
  
  const fetchUserProfile = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      setViewedProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Could not load user profile");
      navigate("/");
    }
  };
  
  const checkIfFollowing = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        throw error;
      }
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };
  
  const handleFollow = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        toast.success("Unfollowed user");
      } else {
        // Follow
        await supabase
          .from("followers")
          .insert({ follower_id: user.id, following_id: userId });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        toast.success("Now following user");
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
      toast.error("Failed to update follow");
    }
  };
  
  const fetchUserStats = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      // Get dream count
      const { data: dreams, error: dreamsError } = await supabase
        .from("dream_entries")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("is_public", true);
      
      if (!dreamsError) {
        setDreamCount(dreams?.length || 0);
      }
      
      // Get followers count
      const { count: followers, error: followersError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);
      
      if (!followersError) {
        setFollowersCount(followers || 0);
      }
      
      // Get following count
      const { count: following, error: followingError } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId);
      
      if (!followingError) {
        setFollowingCount(following || 0);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };
  
  const fetchPublicDreams = async () => {
    if (!user) return;
    
    const targetUserId = userId || user.id;
    
    try {
      const { data, error } = await supabase
        .from("dream_entries")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setPublicDreams(data || []);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    }
  };
  
  const fetchLikedDreams = async () => {
    if (!user) return;
    
    try {
      // For viewing own profile or someone else's
      const targetUserId = userId || user.id;
      
      // First get the liked dream IDs
      const { data: likedData, error: likedError } = await supabase
        .from("dream_likes")
        .select("dream_id")
        .eq("user_id", targetUserId);
      
      if (likedError) throw likedError;
      
      if (likedData && likedData.length > 0) {
        const dreamIds = likedData.map(item => item.dream_id);
        
        // Then fetch the actual dreams
        const { data: dreamData, error: dreamError } = await supabase
          .from("dream_entries")
          .select("*, profiles:user_id(username, display_name, avatar_url)")
          .in("id", dreamIds)
          .eq("is_public", true)
          .order("created_at", { ascending: false });
        
        if (dreamError) throw dreamError;
        
        setLikedDreams(dreamData || []);
      } else {
        setLikedDreams([]);
      }
    } catch (error) {
      console.error("Error fetching liked dreams:", error);
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
        ...(sent || []).map((msg: any) => msg.receiver_id),
        ...(received || []).map((msg: any) => msg.sender_id)
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
  
  const handleUpdateSocialLinks = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          social_links: socialLinks,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      toast.success("Social links updated successfully!");
      setIsSocialLinksOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Error updating social links");
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
  
  const handleStartConversation = () => {
    // Navigate to messages with this user
    if (userId) {
      navigate(`/messages/${userId}`);
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
  
  if (!user) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <Moon size={48} className="mx-auto animate-pulse text-dream-purple" />
          <p className="mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!isOwnProfile && !viewedProfile) {
    return (
      <div className="min-h-screen dream-background flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">User not found</h3>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go back home
          </Button>
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
              <AvatarImage src={profileToShow?.avatar_url} />
              <AvatarFallback className="bg-dream-purple/20 text-dream-purple">
                {profileToShow?.username ? profileToShow.username[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute bottom-0 right-0 rounded-full bg-white shadow-md p-1 h-8 w-8"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Edit size={14} />
              </Button>
            )}
          </div>
          
          <h1 className="text-xl font-bold mt-3">
            {profileToShow?.display_name || profileToShow?.username || "New Dreamer"}
          </h1>
          <p className="text-sm text-muted-foreground">@{profileToShow?.username || "username"}</p>
          
          {profileToShow?.bio && (
            <p className="text-sm text-center mt-2 max-w-md">{profileToShow.bio}</p>
          )}
          
          {/* Social Links */}
          {profileToShow?.social_links && (
            <div className="flex items-center gap-2 mt-2">
              {profileToShow.social_links.twitter && (
                <a 
                  href={`https://twitter.com/${profileToShow.social_links.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500"
                >
                  <Twitter size={16} />
                </a>
              )}
              
              {profileToShow.social_links.instagram && (
                <a 
                  href={`https://instagram.com/${profileToShow.social_links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-500 hover:text-pink-600"
                >
                  <Instagram size={16} />
                </a>
              )}
              
              {profileToShow.social_links.facebook && (
                <a 
                  href={`https://facebook.com/${profileToShow.social_links.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Facebook size={16} />
                </a>
              )}
              
              {profileToShow.social_links.website && (
                <a 
                  href={profileToShow.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Globe size={16} />
                </a>
              )}
              
              {isOwnProfile && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsSocialLinksOpen(true)}
                  className="h-6 text-xs px-2 ml-1"
                >
                  <Edit size={10} className="mr-1" /> Edit
                </Button>
              )}
            </div>
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
            {isOwnProfile ? (
              <>
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
              </>
            ) : (
              <>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollow}
                  className="flex items-center gap-1 text-sm"
                >
                  <UserPlus size={14} /> {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStartConversation}
                  className="flex items-center gap-1 text-sm"
                >
                  <MessageSquare size={14} /> Message
                </Button>
              </>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="dreams" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dreams">Dreams</TabsTrigger>
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
                  {isOwnProfile ? 
                    "Share your dreams to the Lucid Repo to see them here" : 
                    "This user hasn't shared any dreams yet"}
                </p>
                {isOwnProfile && (
                  <Link to="/">
                    <Button variant="outline">Go to Journal</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes" className="mt-4">
            {likedDreams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {likedDreams.map((dream: any) => (
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
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={dream.profiles?.avatar_url} />
                              <AvatarFallback className="bg-dream-purple/20 text-[8px]">
                                {dream.profiles?.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[70px]">
                              {dream.profiles?.display_name || dream.profiles?.username || "User"}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {new Date(dream.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart size={32} className="mx-auto mb-2 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No liked dreams yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isOwnProfile ? 
                    "Explore the Lucid Repo to discover and like dreams" : 
                    "This user hasn't liked any dreams yet"}
                </p>
                <Link to="/lucidrepo">
                  <Button variant="outline">Explore Dreams</Button>
                </Link>
              </div>
            )}
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
      
      {/* Social Links Dialog */}
      <Dialog open={isSocialLinksOpen} onOpenChange={setIsSocialLinksOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="gradient-text">Social Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter size={16} className="text-blue-400" />
                Twitter Username
              </Label>
              <Input
                id="twitter"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                placeholder="username (without @)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram size={16} className="text-pink-500" />
                Instagram Username
              </Label>
              <Input
                id="instagram"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook" className="flex items-center gap-2">
                <Facebook size={16} className="text-blue-600" />
                Facebook Username
              </Label>
              <Input
                id="facebook"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({...socialLinks, facebook: e.target.value})}
                placeholder="username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe size={16} className="text-gray-600" />
                Website URL
              </Label>
              <Input
                id="website"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({...socialLinks, website: e.target.value})}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSocialLinksOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateSocialLinks}
              className="bg-gradient-to-r from-dream-lavender to-dream-purple"
            >
              Save Links
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
                  <div className="bg-dream-purple h-full w-[30%]" />
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
