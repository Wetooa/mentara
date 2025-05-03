import CommunitySidebar from "@/components/community/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Heart, MessageCircle, Plus, Share2 } from "lucide-react";

export default function UserCommunity() {
  const items = [
    {
      id: 1,
      author: "John Doe",
      authorImage: "/avatars/john-doe.png",
      title: "Lorem ipsum dolor sit amet",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatibus.",
      createdAt: new Date(),
      likes: 24,
      comments: 8,
    },
    {
      id: 2,
      author: "Jane Smith",
      authorImage: "/avatars/jane-smith.png",
      title: "Dealing with anxiety during stressful periods",
      description:
        "I've been trying various techniques to manage anxiety during work deadlines. Meditation has been incredibly helpful along with regular exercise. What strategies have worked for you?",
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      likes: 42,
      comments: 15,
    },
    {
      id: 3,
      author: "Alex Johnson",
      authorImage: "/avatars/alex-johnson.png",
      title: "Weekly gratitude practice",
      description:
        "I've started a weekly gratitude journal and it's been transformative for my mental health. Even on difficult days, finding three things to be grateful for shifts my perspective dramatically.",
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      likes: 36,
      comments: 11,
    },
  ];

  return (
    <main className="w-full flex gap-6 h-full">
      <CommunitySidebar />

      <div className="flex-1 p-6 w-full bg-slate-50">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Safe Space</h1>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-50">
              <span className="text-sm font-medium">Latest</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <Button className="rounded-full">Joined</Button>
          </div>
        </div>

        <div className="flex gap-6">
          <section className="flex-1">
            <Card className="mb-6 overflow-visible relative">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <p className="text-slate-500 flex-1">Share your thoughts...</p>

                <Button
                  size="icon"
                  className="absolute top-4 right-4 rounded-full h-9 w-9 bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={item.authorImage} alt={item.author} />
                      <AvatarFallback>{item.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{item.author}</h3>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(item.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    <p className="text-slate-600">{item.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-2 flex gap-4 text-slate-500">
                    <button className="flex items-center gap-1 hover:text-primary">
                      <Heart className="h-4 w-4" /> {item.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary">
                      <MessageCircle className="h-4 w-4" /> {item.comments}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary ml-auto">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <aside className="w-72 shrink-0">
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-semibold text-lg">About Safe Space</h4>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  A community dedicated to sharing mental health experiences in
                  a judgment-free environment. Feel free to share your thoughts,
                  ask questions, and support others on their journey.
                </p>
                <Separator className="my-4" />
                <div className="text-sm text-slate-500">
                  <p>👥 1,248 members</p>
                  <p>📅 Created January 2023</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
