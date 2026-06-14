#!/usr/bin/env python
import sys

def main():
    if len(sys.argv) > 1:
        game = sys.argv[1]
    else:
        game = 'Unknown'
    print(f'Python says: {game}')

if __name__ == '__main__':
    main()
