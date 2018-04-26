#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <dirent.h>
#include <stdlib.h>

#define MAX_PATH 1024

void start_walk(char *);

void dir_walk(char *, void (*function_name)(char *));

void write_header(FILE *);

void write_footer(FILE *);

int main(int argc, char **argv) {
    while (--argc > 0) {
        start_walk(*++argv);
    }
    return 0;
}

void start_walk(char *name) {
    struct stat stbuf;
    if (stat(name, &stbuf) == -1) {
        fprintf(stderr, "fsize: can't access %s\n", name);
        return;
    }

    if ((stbuf.st_mode & S_IFMT) == S_IFDIR) {
        dir_walk(name, start_walk);
    }
}

void dir_walk(char *dir, void (*function_name)(char *)) {
    char name[MAX_PATH];
    struct dirent *dp;
    DIR *dfd;

    if ((dfd = opendir(dir)) == NULL) {
        fprintf(stderr, "dirwalk: can't open %s\n", dir);
        return;
    }

    FILE *fp;
    char file_index[MAX_PATH];
    char file_link[MAX_PATH];

    snprintf(file_index, MAX_PATH, "%s/%s", dir, "index.html");
    fp = fopen(file_index, "w");
    if (fp == NULL) {
        fprintf(stderr, "Error opening index.html\n");
        exit(1);
    }
    write_header(fp);

    while ((dp = readdir(dfd)) != NULL) {
        /* 点开头的文件和文件夹不处理 */
        if (dp->d_name[0] == '.' || strcmp(dp->d_name, "index.html") == 0) {
            continue;
        }

        memset(file_link, 0, MAX_PATH);
        snprintf(file_link, MAX_PATH,
                 "\t\t\t\t\t\t<div class=\"col-md-4 col-sm-6\"><div class=\"thumbnail\"><div class=\"caption\"><a href=\"%s\">%s%s\n",
                 dp->d_name, dp->d_name, "</a></div></div></div>");
        fputs(file_link, fp);

        if (strlen(dir) + strlen(dp->d_name) + 2 > sizeof(name)) {
            fprintf(stderr, "dirwalk: name %s %s too long\n", dir, dp->d_name);
        } else {
            // sprintf(name, "%s/%s", dir, dp->d_name);
            snprintf(name, MAX_PATH, "%s/%s", dir, dp->d_name);
            (*function_name)(name);
        }
    }

    write_footer(fp);
    fclose(fp);
    closedir(dfd);
}

void write_header(FILE *fp) {
    fputs("<!DOCTYPE html>\n", fp);
    fputs("<html>\n", fp);
    fputs("    <head>\n", fp);
    fputs("        <meta charset=\"utf-8\">\n", fp);
    fputs("        <title>书法碑帖</title>\n", fp);
    fputs("        <meta name=\"description\" content=\"中国史上各朝各代书法名家的书法碑帖\">\n", fp);
    fputs("        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n", fp);
    fputs("        <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/css/bootstrap.min.css\">\n",
          fp);
    fputs("        <style>\n", fp);
    fputs("            html {\n", fp);
    fputs("                overflow-y: scroll;\n", fp);
    fputs("            }\n", fp);
    fputs("            #navbar-top {\n", fp);
    fputs("                border-radius: 0;\n", fp);
    fputs("                margin-bottom: 0;\n", fp);
    fputs("            }\n", fp);
    fputs("            #beitie-container {\n", fp);
    fputs("                min-height: 400px;\n", fp);
    fputs("                padding-top: 20px;\n", fp);
    fputs("            }\n", fp);
    fputs("            #footer-info {\n", fp);
    fputs("                height: 50px;\n", fp);
    fputs("                line-height: 50px;\n", fp);
    fputs("                text-align: center;\n", fp);
    fputs("            }\n", fp);
    fputs("        </style>\n", fp);
    fputs("    </head>\n", fp);
    fputs("\n", fp);
    fputs("    <body>\n", fp);
    fputs("        <nav id=\"navbar-top\" class=\"navbar navbar-inverse\">\n", fp);
    fputs("            <div class=\"container-fluit\">\n", fp);
    fputs("                <div class=\"navbar-header\">\n", fp);
    fputs("                    <button type=\"button\" data-toggle=\"collapse\" data-target=\"#navbar-collapse\" class=\"navbar-toggle collapsed\">\n",
          fp);
    fputs("                        <span class=\"sr-only\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span>\n",
          fp);
    fputs("                    </button>\n", fp);
    fputs("                    <a href=\"/\" class=\"navbar-brand\">书法碑帖</a>\n", fp);
    fputs("                </div>\n", fp);
    fputs("            </div>\n", fp);
    fputs("        </nav>\n", fp);
    fputs("        <div id=\"beities\" class=\"container-fluid\">\n", fp);
    fputs("            <div class=\"row\">\n", fp);
    fputs("                <div class=\"col-md-12\" id=\"beitie-container\">\n", fp);
    fputs("                    <div id=\"beitie-list\" class=\"row\">\n", fp);
}

void write_footer(FILE *fp) {
    fputs("                    </div>\n", fp);
    fputs("                </div>\n", fp);
    fputs("            </div>\n", fp);
    fputs("        </div>\n", fp);
    fputs("        <footer id=\"footer\">\n", fp);
    fputs("            <div id=\"footer-info\">© shufabeitie.com</div>\n", fp);
    fputs("        </footer>\n", fp);
    fputs("\n", fp);
    fputs("    </body>\n", fp);
    fputs("</html>\n", fp);
}
