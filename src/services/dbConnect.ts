import chalk from 'chalk';
import { connect, ConnectionOptions } from 'mongoose';

const connectDB = async (uri: string): Promise<boolean> => {
    try {
        console.log(chalk.blueBright('Connecting to database...'));
        const options: ConnectionOptions = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        };
        await connect(uri, options);
        console.log(
            chalk.cyan.italic(
                '==> Successfully established a connection to the database <==',
            ),
        );
        return true;
    } catch (err: any) {
        console.log(chalk.bgRedBright.white(err.message));
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;
