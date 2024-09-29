"use client"

import { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {encrypt} from "@/tools/encryption";
import axios from "axios";

async function handleSignupForm({email, password, username}, setMsg) {
  const user_info = {
    loginType: "signup",
    email: email,
    password: encrypt(password, "passcode"),
    username: username,
  }

  const { data } = await axios.post("/api/auth", user_info);

  if (data) {
    setMsg(data);
    console.log("message set!")
    return data.success;
  }
}

async function handleLoginForm({email, password}, setMsg) {
  const user_info = {
    loginType: "login",
    email: email,
    password: password,
  }

  const { data } = await axios.put("/api/auth", user_info);

  if (data) {
    setMsg(data);
    return data.success;
  }

}

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);

  const [user_info, setUserInfo] = useState({});

  const toggleForm = () => setIsLogin(!isLogin);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <div className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-300">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  id="name"
                  placeholder="example123"
                  className="pl-10 bg-gray-700 text-gray-300 border-gray-600"
                  onChange={(e) => { setUserInfo((state) => { state.username = e.target.value; return state }) }}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                id="email"
                placeholder="you@example.com"
                className="pl-10 bg-gray-700 text-gray-300 border-gray-600"
                onChange={(e) => { setUserInfo((state) => { state.email = e.target.value; return state }) }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                className="pl-10 pr-10 bg-gray-700 text-gray-300 border-gray-600"
                onChange={(e) => { setUserInfo((state) => { state.password = e.target.value; return state }) }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {msg !== null && (
            // Center This
            <div className="text-center">
              <Label className={`${msg.success ? "text-green-500" : "text-red-500"}`}>
                {msg.message}
              </Label>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              console.log("running")
              console.log("is login page", isLogin)

              if (isLogin === true) {
                handleLoginForm(user_info, setMsg).then((success) => {
                  if (success === true) {
                    setTimeout(() => {
                      window.location.href = "/"
                    }, 1000);
                    
                  }
                });
              } else if (isLogin === false) {
                handleSignupForm( user_info, setMsg ).then((success) => {
                  if (success === true) {
                    setTimeout(() => {
                      window.location.href = "/"
                    }, 1000);
                  }
                });
              }
            }}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </div>
        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={toggleForm}
            className="w-full text-sm text-gray-400 hover:text-gray-800"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;