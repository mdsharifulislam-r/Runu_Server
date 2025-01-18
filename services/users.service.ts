import { pool } from "../lib/DB";
import { UserType } from "../types/types";
import { onlineUser } from "./socket.service";

export async function getUsers(
  onlineUsers: { userId: number; socketId: string }[]
) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT name,image,user_id FROM users"
    );
    const items: UserType[] = rows;
    const users = onlineUsers.map((item) => {
      const user = items.find((i) => i.user_id == item.userId);
      return { ...user, socketId: item.socketId };
    });

    return users;
  } catch (error) {}
}

export async function getSingleUsers(id: string) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT name,image,user_id FROM users WHERE user_id=?",
      [id]
    );
    return rows;
  } catch (error) {
    return [];
  }
}

export async function addFriends(userId: string, friendId: string) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT friends FROM users WHERE user_id=?",
      [userId]
    );
    const user: UserType = rows[0];

    const friends = user.friends?.split(",");

    if (friends?.some((item) => item == friendId)) {
      return;
    }

    friends?.push(friendId);
    const str = friends?.toString()[0] == "," ? friendId : friends?.toString();
    await pool.execute("UPDATE users SET friends=? WHERE user_id=?", [
      str,
      userId,
    ]);

    const [rows2]: any[] = await pool.execute(
      "SELECT request FROM users WHERE user_id=?",
      [friendId]
    );
    const user2: UserType = rows2[0];

    const friends2 = user2.request?.split(",");
    friends2?.push(userId);
    const str2 = friends2?.toString()[0] == "," ? userId : friends2?.toString();

    await pool.execute("UPDATE users SET request=? WHERE user_id=?", [
      str2,
      friendId,
    ]);
  } catch (error) {
    console.log(error);
  }
}

export async function getUsersAll(
  id: number = 0,
  search?: string
): Promise<any> {
  try {
    const [user]: any[] = await pool.execute(
      "SELECT friends,user_id FROM users WHERE user_id=?",
      [id]
    );
    const friends: string = user?.length ? user[0]?.friends : "";
    const [rows]: any[] = await pool.execute("SELECT user_id FROM users");
    const users: UserType[] = rows;
    const all_users = users?.map((item) => {
      const on_user = onlineUser?.find((item2) => item2.userId == item.user_id);
      if (
        item.user_id == id ||
        friends.split(",").includes(item.user_id.toString())
      ) {
        return;
      }
      if (on_user?.userId) {
        return on_user;
      }
      return {
        userId: item?.user_id,
      };
    });

    let temp: any[] = [];
    let temp2: any[] = [];
    if (search) {
      all_users.forEach(async (item) => {
        if (item == undefined) {
          return;
        }
        const [data]: any[] = await pool.execute(
          "SELECT * FROM users WHERE user_id=?",
          [item?.userId || 0]
        );

        const user: UserType = data[0];
        const exist = user?.name
          ?.toLowerCase()
          ?.includes(search?.toLowerCase() || "");

        if (exist) {
          temp.push(item);
        }
      });
    }

    return search ? temp : all_users;
  } catch (error) {}
}

export async function getFriends(id: string) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT friends FROM users WHERE user_id=?",
      [id]
    );
    const user: UserType = rows[0];
    const friends = user?.friends?.split(",").map(Number);
    const users: { userId: number; socketId: number }[] = await getUsersAll();
    const temp = friends?.map((item) => {
      if (users?.some((item2) => item2.userId == item)) {
        return users?.find((item2) => item2.userId == item);
      }
    });

    return temp?.includes(undefined) ? [] : temp;
  } catch (error) {
    console.log(error);
  }
}

export async function getRequest(id: string) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT request FROM users WHERE user_id=?",
      [id]
    );
    const user: UserType = rows[0];
    const friends = user?.request?.split(",").map(Number);
    const users: { userId: number; socketId: number }[] = await getUsersAll();
    const temp = friends?.map((item) => {
      if (users?.some((item2) => item2.userId == item)) {
        return users?.find((item2) => item2.userId == item);
      }
    });

    return temp?.includes(undefined) ? [] : temp;
  } catch (error) {
    console.log(error);
  }
}

export async function acceptRequest(userId: string, friendId: string) {
  try {
    const [rows]: any[] = await pool.execute(
      "SELECT friends FROM users WHERE user_id=?",
      [userId]
    );
    const user: UserType = rows[0];

    const friends = user.friends?.split(",");
    if (friends?.some((item) => item == friendId)) {
      return;
    }

    friends?.push(friendId);
    const str = friends?.length ? friends?.toString() : friendId;
    await pool.execute("UPDATE users SET friends=? WHERE user_id=?", [
      str,
      userId,
    ]);

    const [rows2]: any[] = await pool.execute(
      "SELECT request FROM users WHERE user_id=?",
      [userId]
    );
    const user2: UserType = rows2[0];

    const friends2 = user2.request
      ?.split(",")
      .filter((item) => item != friendId);

    const str2 = (friends2?.length || 0) > 1 ? friends2?.toString() : "";

    await pool.execute("UPDATE users SET request=? WHERE user_id=?", [
      str2,
      userId,
    ]);
  } catch (error) {
    console.log(error);
  }
}


export async function arrangeFriends(userId:string,frndId:string) {
    try {
   
    
        const [rows]:any[] = await pool.execute('SELECT friends FROM users WHERE user_id=?',[userId])
        const user:UserType=rows[0]
        const altfriends=user?.friends?.split(',').filter(item=>item!=frndId)
        altfriends?.unshift(frndId)
     
        
        await pool.execute("UPDATE users SET friends=? WHERE user_id=?", [altfriends?.toString(),userId]);

        
        const [rows2]:any[] = await pool.execute('SELECT friends FROM users WHERE user_id=?',[frndId])
        const user2:UserType=rows2[0]
        if(!user2?.friends?.split(',').includes(userId)){
            return
        }
        const altfriends2=user2?.friends?.split(',').filter(item=>item!=userId)
        altfriends2?.unshift(userId)
      
        
        await pool.execute("UPDATE users SET friends=? WHERE user_id=?", [altfriends2.toString(),frndId]);
    } catch (error) {
        console.log(error);
    }
}