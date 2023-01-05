import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserRequest } from './create-user-request.dto';
import { CreateUserEvent } from './create-user.event';

@Injectable()
export class AppService {
  private readonly users: any[] = [];

  constructor(
    @Inject('COMMUNICATION') private readonly communicationClient: ClientProxy,
    @Inject('ANALYTICS') private readonly analyticsClient: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  // signupでユーザーアカウント追加すると各マイクロサービスで以下が実行される
  // communication: 登録したアドレスあてにメールが送信される
  // analytics: 登録したアドレスがいつ登録されたのか記録される
  createUser(createUserRequest: CreateUserRequest) {
    this.users.push(createUserRequest);
    this.communicationClient.emit(
      'user_created',
      // newでclass化したデータとして送ると、マイクロサービス側でclassとして受け取れる
      new CreateUserEvent(createUserRequest.email),
    );
    this.analyticsClient.emit(
      'user_created',
      new CreateUserEvent(createUserRequest.email),
    );
  }

  getAnalytics() {
    // sample-analiticsへ送信して、sample-analitics内の@MessagePatternにて受け取る
    return this.analyticsClient.send({ cmd: 'get_analytics' }, {});
  }
}
