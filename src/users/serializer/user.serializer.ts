// user.serializer.ts
export class UserSerializer {
  static sanitize(userDoc: any) {
    // Хэрвээ Mongoose Document бол toObject() хийх
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };

    // Sensitive fields устгах
    delete user.password;
    delete user.googleId;
    delete user.facebookId;

    return user;
  }

  static sanitizeMany(userDocs: any[]) {
    return userDocs.map((doc) => this.sanitize(doc));
  }
}
