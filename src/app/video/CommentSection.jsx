"use client"

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { User } from 'lucide-react';

import SupabaseClient from "@/supabase/server";

const Comment = ({ user, comment, created_at }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="flex space-x-4 py-4">
      <Avatar className="w-10 h-10">
        <AvatarImage src={user?.avatar_url} alt={user?.username} />
        <AvatarFallback className='bg-gray-600' ><User /></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm text-gray-200">{user?.username}</span>
          <span className="text-xs text-gray-400">{timeAgo(new Date(created_at))}</span>
        </div>
        <p className="mt-1 text-sm text-gray-300">{comment}</p>
      </div>
    </div>
  );
};

const CommentSection = ({ videoId, setIsTyping }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user_client, setUserClient] = useState(null);
  const [pre_comment_profiles, setPreCommentProfiles] = useState(null);
  const [all_profile_fetched, setAllProfilesFetched] = useState(false);

  const supabase = SupabaseClient();
  

  async function getProfiles() {
    const response = await fetch("/api/profile?all=true");
    if (!response.ok) return;

    const data = await response.json();
    return data.profiles;
  }

  useEffect(() => {
    async function getProfilesForComments() {
      if (all_profile_fetched) return;
      const profiles = await getProfiles();
      setPreCommentProfiles(() => {
        setAllProfilesFetched(true);
        return profiles;
      });
    }

    async function process_comments(comments) {
      if (comments.length === 0) return;
  
      const processed = comments.map((comment) => {
        let user_vid_comment = comment.Account.username;
        let found = pre_comment_profiles.find(user => user.username === user_vid_comment) || null;

        let comment_proccessed = { ...comment };
        delete comment_proccessed.Account;
  
        return {
          ...comment_proccessed,
          user: found,
        }
      });

      setComments((prev) => [...prev, ...processed]);
    };

    const loadComments = async () => {
      setIsLoading(true);
      try {
        const {data: Comments, error} = await supabase.from("VideoComments")
          .select("id, comment, created_at, Account(username)")
          .eq("video_id", videoId)
          .order("created_at", {ascending: false});
          
        if (error) {
          console.log(error);
        }

        process_comments(Comments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const user = JSON.parse(localStorage.getItem("user"));
    setUserClient(user);
    getProfilesForComments();
    loadComments();

    // Modify your realtime subscription code:
    const realtime_comments = supabase.channel(videoId)
    .on(
      "postgres_changes",
      { 
        event: "INSERT", 
        schema: "public", 
        table: "VideoComments"
      },
      async (payload) => {
        if (payload.new?.video_id === videoId) {
          // Get the user information for the new comment

          const {data: payload_user_comment} = await supabase.from("VideoComments")
          .select("id, comment, created_at, Account(username)")
          .eq("video_id", videoId)
          .eq("id", payload.new.id)
          .single();

          const user = pre_comment_profiles.find(
            profile => profile.username === payload_user_comment.Account.username
          );

          const processedComment = {
            ...payload_user_comment,
            user: user
          };

          // Add to existing comments
          setComments(prevComments => [processedComment, ...prevComments]);
        }
      }
    )
    .subscribe((status) => {
      console.log("Comment Section Live Connection", status)
    });

    return () => {
      supabase.removeChannel(realtime_comments);
    }

  }, [all_profile_fetched, pre_comment_profiles, supabase, videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
  
    try {
      const { error } = await supabase
        .from("VideoComments")
        .insert({
            video_id: videoId,
            comment: newComment,
            account_id: user_client.account_id, // Assuming you have the user's ID
          })
        .select('*, Account(username)');
  
      if (error) throw error;
  
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  function handleTyping(e) {
    setIsTyping(true);
    setNewComment(e.target.value);
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => setIsTyping(false), 1000);
  }

  if (isLoading) {
    return <div className="mt-8 text-gray-300">Loading comments...</div>;
  }

  return (
    <div className="mt-8 bg-gray-900 text-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-100">{comments.length} Comments</h2>
      {user_client && <div className="flex space-x-4 mb-6">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user_client.avatar_url} alt="Current User" />
          <AvatarFallback className='bg-gray-600'><User /></AvatarFallback>
        </Avatar>
        <form onSubmit={handleSubmit} className="flex-1">
          <Textarea
            value={newComment}
            onChange={handleTyping}
            placeholder="Add a comment..."
            className="mb-2 resize-none bg-gray-800 text-gray-100 border-gray-700"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="secondary" className="bg-gray-700 text-gray-100 hover:bg-gray-600">Comment</Button>
          </div>
        </form>
      </div>}
      <Separator className="my-4 bg-gray-700" />
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div key="sayanora">
          {comments.map((comment) => (
            <Comment key={comment.id} {...comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;