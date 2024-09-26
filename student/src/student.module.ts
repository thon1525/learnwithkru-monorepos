import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { StudentRepository } from './database/repositories/student.repository';
import { StudentModel, studentSchema } from './database/models/student.model'; // ensure this path is correct

@Module({
  imports: [
    // Add MongooseModule.forFeature to register the Student model with Nest
    MongooseModule.forFeature([
      { name: StudentModel.modelName, schema: studentSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentRepository], // export if needed in other modules
})
export class StudentModule {}
