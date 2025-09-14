// app/profile/[username]/page.tsx
"use client";

import { FaArrowLeft, FaCommentDots, FaGlobe, FaGraduationCap, FaClock } from 'react-icons/fa';
import Link from 'next/link';

// This function simulates fetching user data. Notice the bio and language fields are complete.
const getUserData = (username: string) => {
  const users: { [key: string]: any } = {
    'elena-rodriguez': {
      name: 'Elena Rodriguez',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      bio: "Hola! I'm a designer from Spain, currently living in London. I love photography, hiking, and helping others learn Spanish. Looking to practice my English!",
      nativeLanguage: 'Spanish',
      learningLanguages: ['English', 'French'],
      talkTime: {
        thisWeek: '4h 32m',
        thisMonth: '18h 45m',
        totalTime: '127h 23m',
        currentStreak: 8
      }
    },
    'kenji-tanaka': {
      name: 'Kenji Tanaka',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: "Hello from Tokyo! I'm a software developer. My hobbies include video games and cooking. I can help you with Japanese if you can help me with English.",
      nativeLanguage: 'Japanese',
      learningLanguages: ['English'],
      talkTime: {
        thisWeek: '2h 15m',
        thisMonth: '9h 30m',
        totalTime: '76h 48m',
        currentStreak: 3
      }
    },
    'fatima-al-fassi': {
      name: 'Fatima Al-Fassi',
      avatarUrl: 'https://randomuser.me/api/portraits/women/22.jpg',
      bio: "Marhabaan! I am a student of literature from Morocco. I enjoy reading classic novels and learning about different cultures. I'm looking for partners to practice my English.",
      nativeLanguage: 'Arabic',
      learningLanguages: ['English', 'German'],
      talkTime: {
        thisWeek: '6h 18m',
        thisMonth: '24h 12m',
        totalTime: '203h 55m',
        currentStreak: 12
      }
    },
  };

  const formattedUsername = decodeURIComponent(username).toLowerCase().replace(' ', '-');
  return users[formattedUsername];
};

const UserProfilePage = ({ params }: { params: { username: string } }) => {
  const userData = getUserData(params.username);
  const formattedUsernameForLink = userData ? userData.name.toLowerCase().replace(' ', '-') : '';

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-700">User Not Found</h2>
        <Link href="/messages" className="mt-4 text-blue-600 hover:underline">
          Return to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6">
        <Link href="/messages" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
          <FaArrowLeft className="mr-2" />
          Back to Messages
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 flex flex-col sm:flex-row items-center">
            <img src={userData.avatarUrl} alt={userData.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
            <div className="mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
              <Link 
                href={`/messages?chatWith=${formattedUsernameForLink}`}
                className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition"
              >
                <div className="flex items-center">
                  <FaCommentDots className="mr-2" /> Send Message
                </div>
              </Link>
            </div>
          </div>

          {/* === PROFILE DETAILS (RESTORED) === */}
          <div className="p-8 border-t border-gray-200">
            {/* Bio Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">About Me</h2>
              <p className="text-gray-600 leading-relaxed">{userData.bio}</p>
            </div>

            {/* Languages Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Languages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <FaGlobe className="text-2xl text-green-500 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Native Language</h3>
                    <p className="text-gray-600">{userData.nativeLanguage}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaGraduationCap className="text-2xl text-purple-500 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Learning</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userData.learningLanguages.map((lang: string) => (
                        <span key={lang} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Talk Time Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Talk Time Statistics</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FaClock className="text-blue-500 mr-2" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">{userData.talkTime.thisWeek}</div>
                    <div className="text-gray-500 text-sm">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FaClock className="text-purple-500 mr-2" />
                    </div>
                    <div className="text-lg font-bold text-purple-600">{userData.talkTime.thisMonth}</div>
                    <div className="text-gray-500 text-sm">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-orange-500 mr-2">🔥</span>
                    </div>
                    <div className="text-lg font-bold text-orange-600">{userData.talkTime.currentStreak}</div>
                    <div className="text-gray-500 text-sm">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-indigo-500 mr-2">📊</span>
                    </div>
                    <div className="text-lg font-bold text-indigo-600">{userData.talkTime.totalTime}</div>
                    <div className="text-gray-500 text-sm">All Time</div>
                  </div>
                </div>
                
                {userData.talkTime.currentStreak >= 7 && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center text-orange-700">
                      <span className="mr-2">🔥</span>
                      <span className="text-sm font-medium">
                        {userData.name.split(' ')[0]} is on a {userData.talkTime.currentStreak}-day conversation streak!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;