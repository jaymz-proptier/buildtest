import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { User } from '@/lib/definitions';


export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
        async authorize(credentials) {
            if (credentials.swId && credentials.swPwd) {
                const res = await fetch(`${process.env.NEXTAUTH_URL}/api/login`, {
                    method: "POST",
                    body: JSON.stringify({
                        swId: credentials?.swId,
                        swPwd: credentials?.swPwd,
                    }),
                });
                
                const userData = await res.json();
                console.log("userData",userData, userData?.data);
                if (!userData?.data) {
                    console.log("로그인 정보가 올바르지 않습니다.");
                    return null;
                }
                console.log(userData);
                /* const sql = "select swId, name, sawonCode, sosok from tb_pptn_sawon where swId = ? and swPwd = SHA2(CONCAT(CONCAT('*', UPPER(SHA1(UNHEX(SHA1(?))))), 'ribo20240408!@'),256) and isStatus='재직' and useYn='Y'";
                const result = await executeQuery(sql, [credentials.swId, credentials.swPwd]) as unknown[];
                const row = result[0] as any[];
                const userData = JSON.parse(JSON.stringify(row)); */
                let loginRes = {
                    success : true,
                    data : {
                    user: {
                        swId: userData.data.swId,
                        name: userData.data.name,
                        sawonCode: userData.data.sawonCode,
                        sosok: userData.data.sosok
                    },
                    }
                }
                // 로그인 실패 처리
                if (!loginRes.success) {
                    return null;
                }
                // 로그인 성공 처리
                const user = {
                    profileUrl: "",
                    name: loginRes.data.user.name ?? '',
                    swId: loginRes.data.user.swId ?? '',
                    sawonCode: loginRes.data.user.sawonCode ?? 0,
                    sosok: loginRes.data.user.sosok ?? '',
                } as User;
                return user;
            }
            return null;
        },
        })
    ],
    callbacks: {
        async session({ session, token, user }) {
        console.log("session");
        session.user = token.user as User
        return session;
        },
        async jwt({ token, user, trigger, session }) {
        if (user) {
            token.user = user;
        }
        return token;
        },
    },
});