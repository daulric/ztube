"use client"

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Video, FileText, Eye, User, BadgeCheck } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

const CardMark = ({message}) => {
  return (
    <Card className="bg-gray-800 shadow-lg border border-gray-700">
      <CardContent className="p-6 flex items-center justify-center h-40">
        <p className="text-gray-400 text-center">{message}</p>
      </CardContent>
    </Card>
  )
}

const UserProfilePage = ({ username }) => {
  const [activeTab, setActiveTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [profile, setProfileInfo] = useState(null);

  const getProfile = useCallback(async () => {
    if (!username) {
      const checkStorage = () => {
        const item = localStorage.getItem("user");
        if (item !== null) {
          const temp_profile = JSON.parse(item);
          setProfileInfo(temp_profile);
        } else {
          setTimeout(checkStorage, 3);
        }
      };
      checkStorage();
    } else {
      try {
        const response = await fetch(`/api/profile?username=${username}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        if (data.success) {
          setProfileInfo(data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }
  }, [username]);
  
  const getVideos = useCallback(async () => {
    if (!profile) return;

    const query = new URLSearchParams({
      username: profile.username,
    });

    try {
      const response = await fetch(`/api/video?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  }, [profile]);
  
  useEffect(() => {
    getProfile();
  }, [getProfile]);
  
  useEffect(() => {
    if (profile) {
      getVideos();
    }
  }, [getVideos, profile]);

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <Card className="mb-6 bg-gray-800 shadow-md border border-gray-700">
        <CardContent className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
          <Avatar className="h-24 w-24 ring-2 ring-gray-700">
            <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
            <AvatarFallback className="bg-gray-700 text-gray-300">
              <User className="h-20 w-20"/>
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start">
              {profile?.username}
              {profile?.is_verified && (
                <BadgeCheck className="ml-2 h-5 w-5 text-blue-400" />
              )}
            </h1>
            <p className="text-gray-400 mt-2">{profile?.aboutme}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
          <TabsTrigger 
            value="videos" 
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Videos
          </TabsTrigger>
          <TabsTrigger 
            value="blogs"
            className="data-[state=active]:bg-gray-700 data-[state=active]:text-white"
          >
            Blogs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.length !== 0 ? videos.map((video) => (
              <Link href={`/video?id=${video.video_id}`} key={video.video_id} className="block">
                <Card className="overflow-hidden bg-gray-800 shadow-lg transition-shadow hover:shadow-xl hover:bg-gray-700 border border-gray-700">
                  <CardHeader className="p-0">
                    <Image
                      src={video.thumbnail} 
                      alt={video.title} 
                      width={300} 
                      height={200} 
                      className="w-full h-40 object-cover"
                      loading='eager'
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="flex items-center text-lg mb-2 text-white">
                      <Video className="mr-2 h-5 w-5 text-blue-400" />
                      {video.title}
                    </CardTitle>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" /> {video.views}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <CardMark message={`no videos from ${profile ? profile?.username : ""}`}/>
            )}
          </div>
        </TabsContent>
        <TabsContent value="blogs">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[/* Blog Feature didn't come yet so this is blank for now */ ].length !== 0 ? [].map((blog) => (
              <Link href={blog.url} key={blog.id} className="block">
                <Card className="bg-gray-800 shadow-lg transition-shadow hover:shadow-xl hover:bg-gray-700 border border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <FileText className="mr-2 text-green-400" />
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">Date: {blog.date}</p>
                    <p className="text-gray-400">Read time: {blog.readTime}</p>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <CardMark message={"blog feature not available at this moment"} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;