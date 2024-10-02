import { NextResponse } from "next/server";
import SupabaseServer from "@/supabase/server"

export async function GET(request) {

    const searchParams = request.nextUrl.searchParams;

    try {

        const video_id = searchParams.get("id");

        if (!video_id) { throw "No Video To Show!" }

        const supa_client = SupabaseServer();
        const videos_db = supa_client.from("Video");
        const video_storage = supa_client.storage.from("Videos");

        const {data: video_data, error: checkError} = await videos_db.select().eq("video_id", video_id).single();
        if ( checkError ) { throw "Server Error" };
        if ( video_data.length === 0 ) { throw "No Video Found" }

        const { data: video_files, error: allVideoError } = await video_storage.list();
        if (allVideoError) { throw "Server Error" }

        const video_found = video_files.filter((item) => item.name.split(".")[0] === video_data.video_id);
        if (video_found.length === 0) { throw "video id found, but no video" }

        const video_display = video_found[0];

        return NextResponse.json({
            success: true,
            message: "Video Found",
            video_url: video_storage.getPublicUrl(video_display.name).data.publicUrl,
        }, { status: 200 })

    } catch (e) {
        return NextResponse.json({
            success: false,
            message: e,
        }, { status: 200 })
    }

}